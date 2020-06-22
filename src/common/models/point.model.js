/* eslint-disable indent */
import moment from 'moment-timezone';
import { pick, keys } from 'lodash';
import { Model, DataTypes } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';
import httpStatus from 'http-status';

import messages from '../../config/messages';
import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import eventBus from '../services/events/event-bus';

import APIException from '../utils/APIException';


/**
 * Create connection
 */
const sequelize = postgres.connect();

class Point extends Model {
}

/**
 * Point Schema
 * @public
 */
Point.init(
    {
        /** note attributes */
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER
        },
        /** note detail */
        customer_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        transaction_id: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        point: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(155),
            allowNull: true
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.JSONB,
            defaultValue: {
                id: null,
                name: null,
                avatar: null
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        tableName: 'tbl_points'
    }
);

/**
 * Register event emiter
 */
Point.EVENT_SOURCE = `${serviceName}.point`;
Point.Events = {
    POINT_CREATED: `${serviceName}.point.created`,
    POINT_UPDATED: `${serviceName}.point.updated`,
    POINT_DELETED: `${serviceName}.point.deleted`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Point.addHook('afterSave', (model) => {
    eventBus.emit(Point.Events.POINT_CREATED, model);
    eventBus.emit(
        AppEvent.Events.APP_EVENT_CREATED,
        {
            source: 'point',
            message: `${model.created_by.id} đã thêm thành công dữ liệu cộng điểm cho khách hàng: ${model.customer_id}`,
            user: model.created_by,
            data: model.dataValues
        }
    );
});

Point.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);
    if (newModel.is_active === false) eventBus.emit(Point.Events.POINT_CREATED, model);
    eventBus.emit(
        AppEvent.Events.APP_EVENT_UPDATED,
        {
            source: 'customers',
            message: `${params.updated_by.id} đã cập nhật thông tin khách hàng: ${model.id}`,
            user: params.updated_by,
            data: {
                id: newModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged),
            }
        }
    );
});

/**
 * Transform postgres model to expose object
 */
Point.transform = (model) => {
    const transformed = {};
    const fields = [
        /** Point  */
        'id',
        'customer_id',
        'transaction_id',
        'value',
        'point',
        'address',
        'is_active',
        /** Point management */
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });
    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};

/**
 * List history
 *
 * @public
 * @param {String} customerId
 */
Point.getPointByCustomerId = async (customerId) => {
    try {
        const result = await Point.sequelize.query(`
            SELECT SUM(P."point") as total_point
            FROM tbl_points P
            WHERE P."customer_id" = '${customerId}' AND P."is_active"=true
        `);
        return result[0];
    } catch (ex) {
        throw ex;
    }
};

/**
 * Get Post By Id
 *
 * @public
 * @param {String} pointId
 * @returns {Promise<Point, APIException>}
 */
Point.getPointById = async (pointId) => {
    try {
        const point = await Point.findByPk(pointId);
        if (!point) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return point;
    } catch (ex) {
        throw (ex);
    }
};
/**
 * @typedef Point
 */
export default Point;
