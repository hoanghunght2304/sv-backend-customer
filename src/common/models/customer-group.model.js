/* eslint-disable indent */
import moment from 'moment-timezone';
import httpStatus from 'http-status';
import { DataTypes, Model } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';
import { pick, isEqual, includes, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class CustomerGroup extends Model { }

/**
 * User Schema
 * @public
 */
CustomerGroup.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        note: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        store: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null,
                phone: null
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        tableName: 'tbl_groups'
    }
);

/**
 * Register event emiter
 */
CustomerGroup.EVENT_SOURCE = `${serviceName}.customer-group`;
CustomerGroup.Events = {
    CUSTOMER_GROUP_CREATED: `${serviceName}.customer-group.created`,
    CUSTOMER_GROUP_UPDATED: `${serviceName}.customer-group.updated`,
    CUSTOMER_GROUP_DELETED: `${serviceName}.customer-group.deleted`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
CustomerGroup.addHook('afterCreate', (model, options) => {
    const { params } = options;
    eventBus.emit(
        CustomerGroup.Events.CUSTOMER_GROUP_CREATED,
        {
            model: model.dataValues,
            customers: params.customers
        }
    );
});

CustomerGroup.addHook('afterUpdate', (model, options) => {
    const { user, data } = options.params;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);
    eventBus.emit(
        CustomerGroup.Events.CUSTOMER_GROUP_UPDATED,
        {
            source: 'customer-group',
            user: user,
            customer: {
                old: data.old,
                new: data.new
            },
            model: {
                id: oldModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged),
            },
        }
    );
});

CustomerGroup.addHook('afterDestroy', (model, options) => {
    const { params } = options;

    eventBus.emit(
        AppEvent.Events.APP_EVENT_DELETED,
        {
            source: 'customer-group',
            message: `${params.updated_by.id} đã xóa nhóm khách hàng: ${model.id}`,
            user: params.updated_by,
            data: model.dataValues
        }
    );
});

/**
 * Transform mongoose model to expose object
 */
CustomerGroup.transform = (model) => {
    const transformed = {};
    const fields = [
        /** for info customer */
        'id',
        'name',
        'members',
        'note',
        'store',
        'customers',

        /** for collection manager */
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });
    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    // transformed.members = parseInt(model.members, 10);
    transformed.members = +model.members;
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
CustomerGroup.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = ['name', 'note', 'store', 'customers'];

    /** get all changable properties */
    allChangableProperties.forEach((field) => {
        if (includes(allChangableProperties, field)) {
            changedProperties.push(field);
        }
    });

    /** get data changed */
    const dataChanged = [];
    changedProperties.forEach(field => {
        if (!isEqual(newModel[field], oldModel[field])) {
            dataChanged.push(field);
        }
    });
    return dataChanged;
};

const filterConditions = (params) => {
    let queries = 'g.is_active = true ';
    if (params.start_time && params.end_time) {
        params.start_time.setHours(0, 0, 0, 0);
        params.end_time.setHours(23, 59, 59, 999);
    }
    if (params.keyword) queries += `AND g.name ILIKE '%${params.keyword}%' `;
    if (params.stores) queries += 'AND g.store ->> \'id\' IN (:stores) ';
    if (params.start_time && params.end_time) queries += 'AND (g.created_at BETWEEN :start_time AND :end_time)';
    return queries;
};

CustomerGroup.list = async (params) => {
    try {
        const queryConditions = filterConditions(params);
        const result = await CustomerGroup.sequelize.query(`
        SELECT g.*, COUNT(gd."group_id") members
        FROM tbl_customer_groups g
            LEFT JOIN tbl_customer_group_details gd ON gd.group_id = g.id 
        WHERE ${queryConditions}
        GROUP BY g.id
        ORDER BY created_at ASC  
        OFFSET ${params.skip}
        LIMIT ${params.limit}`,
            {
                replacements: params
            }
        );
        if (!result[0]) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return result[0];
    } catch (ex) {
        throw ex;
    }
};

CustomerGroup.countQueries = async (params) => {
    try {
        const queryConditions = filterConditions(params);
        const result = await CustomerGroup.sequelize.query(`
            SELECT COUNT(*)
            FROM tbl_customer_groups AS g
            WHERE ${queryConditions}`,
            {
                replacements: params
            }
        );

        return result[1].rowCount || 0;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Get Group Customer By Id
 *
 * @public
 * @param {String} groupId
 */
CustomerGroup.getGroupById = async (groupId) => {
    try {
        const result = await CustomerGroup.sequelize.query(`
            SELECT 
                g.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', c.id,
                            'name', c.name,
                            'phone', c.phone,
                            'email', c.email,
                            'birthday', c.birthday
                        )
                    )
                    FILTER (WHERE c.id IS NOT NULL), '[]'
                ) as customers
            FROM tbl_customer_groups AS g
                LEFT JOIN tbl_customer_group_details as gd ON gd.group_id = g.id
                LEFT JOIN tbl_customers as c ON c.id = gd.customer_id AND c.is_active = true
            WHERE
                g.id = ${groupId} AND
                g.is_active = true
            GROUP BY
                g.id
        `);

        if (!result[0][0]) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }

        return result[0][0];
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Get Customer Group By Id
 *
 * @public
 * @param {String} groupId
*/
CustomerGroup.checkDuplicateGroupId = async (groupId) => {
    try {
        const group = await CustomerGroup.findByPk(groupId);
        if (group) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.GROUP_EXISTS
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * @typedef CustomerGroup
 */
export default CustomerGroup;
