import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model } from 'sequelize';
import { isEqual, includes, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Rank extends Model { }


/**
 * Rank Schema
 * @public
 */
Rank.init(
    {
        id: {
            type: DataTypes.STRING(25),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        note: {
            type: DataTypes.STRING(500),
            defaultValue: null
        },
        min_price: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        discount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        /** collection management */

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
        tableName: 'tbl_ranks'
    }
);

/**
 * Register event emiter
 */
Rank.EVENT_SOURCE = `${serviceName}.rank`;
Rank.Events = {
    RANK_CREATED: `${serviceName}.rank.created`,
    RANK_UPDATED: `${serviceName}.rank.updated`,
};

Rank.addHook('afterCreate', (model, options) => {
    const { params } = options;
    eventBus.emit(
        Rank.Events.RANK_CREATED,
        {
            model: model.dataValues,
            customers: params.customers
        }
    );
});


Rank.addHook('afterUpdate', (model, options) => {
    const { user, customers } = options.params;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);
    eventBus.emit(
        Rank.Events.RANK_UPDATED,
        {
            user: user,
            customers: customers,
            model: {
                id: oldModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged),
            },
        }
    );
});


/**
 * Transform mongoose model to expose object
 */
Rank.transform = (model) => {
    const transformed = {};
    const fields = [
        'id',
        'name',
        'note',
        'min_price',
        'discount',
        'is_active',
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
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Rank.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        'name',
        'note',
        'min_price',
        'discount'
    ];

    /** get all changable properties */
    Object.keys(newModel).forEach((field) => {
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

/**
 * Get Rank By Id
 *
 * @public
 * @param {String} RankId
 */
Rank.getRankById = async (RankId) => {
    try {
        const rank = await Rank.findByPk(RankId);
        if (!rank) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return rank;
    } catch (ex) {
        throw (ex);
    }
};

Rank.checkDuplicateById = async (RankId) => {
    try {
        const rank = await Rank.findByPk(RankId);
        if (rank) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.BAD_REQUEST
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};
/**
 * @typedef Rank
 */
export default Rank;
