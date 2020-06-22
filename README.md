# sv-backend-customer

# demo schema with postgres

<!-- 
import moment from 'moment-timezone';
import httpStatus from 'http-status';
import { Model, DataTypes, Op } from 'sequelize';
import { values, isEqual, includes } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();

class Customer extends Model {
}

Customer.Genders = {
    MALE: 'male',
    FEMALE: 'female',
    UNKNOWN: 'unknown'
};

Customer.PhoneGroups = {
    HOME: 'home',
    MOBILE: 'mobile',
    COMPANY: 'company',
    OTHER: 'other'
};

Customer.EmailGroups = {
    HOME: 'home',
    COMPANY: 'company',
    OTHER: 'other'
};

/**
 * Customer Schema
 * @public
 */
Customer.init(
    {
        /** attributes */
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER
        },
        phones: {
            type: DataTypes.JSONB,
            defaultValue: [
                {
                    group: null,
                    address: null,
                    isDefault: null
                }
            ]
        },
        emails: {
            type: DataTypes.JSONB,
            defaultValue: [
                {
                    group: null,
                    address: null,
                    isDefault: null
                }
            ]
        },
        address: {
            type: DataTypes.STRING(155),
            defaultValue: null
        },

        /** detail */
        name: {
            type: DataTypes.STRING(100),
            validate: { notNull: false }
        },
        note: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        avatar: {
            type: DataTypes.STRING(255),
            defaultValue: 'https://cdn.csell.com/upload/pictures/avatar-default.jpg'
        },
        gender: {
            type: DataTypes.STRING(50),
            values: values(Customer.Genders),
            default: Customer.Genders.UNKNOWN
        },
        birthday: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        hashtag: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        lastInteract: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        interactCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        /** customer management */
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdBy: {
            type: DataTypes.JSONB,
            defaultValue: {
                id: null,
                name: null,
                avatar: null
            }
        }
    },
    {
        timestamps: true,
        sequelize: sequelize,
        modelName: 'customer',
        tableName: 'tbl_customers'
    }
);

/**
 * Register event emiter
 */
Customer.EVENT_SOURCE = `${serviceName}.customer`;
Customer.Events = {
    CUSTOMER_CREATED: `${serviceName}.customer.created`,
    CUSTOMER_UPDATED: `${serviceName}.customer.updated`,
    CUSTOMER_DELETED: `${serviceName}.customer.deleted`,
    ADD_CUSTOMER_TO_GROUP: `${serviceName}.customer.add_customer_to_group`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Customer.addHook('afterSave', (model) => {
    const customer = model;
    /** set interact */
    customer.lastInteract = new Date();
    customer.interactCount += 1;
});
Customer.addHook('beforeSave', (model) => {
    const customer = model;
    /** set interact */
    customer.lastInteract = new Date();
    customer.interactCount += 1;
});

Customer.addHook('afterSave', (model) => {
    eventBus.emit(Customer.Events.CUSTOMER_CREATED, model);
});

Customer.addHook('afterBulkUpdate', (model) => {
    eventBus.emit(Customer.Events.CUSTOMER_UPDATED, model);
});

Customer.addHook('afterDestroy', (model) => {
    eventBus.emit(Customer.Events.CUSTOMER_DELETED, model);
});

/**
* Transform postgres model to expose object
*/
Customer.transform = (model) => {
    const transformed = {};
    const fields = [
        /** customer attributes */
        'id',
        'phones',
        'emails',
        'address',

        /** customer detail */
        'name',
        'note',
        'avatar',
        'gender',
        'birthday',
        'hashtag',
        'lastInteract',
        'interactCount',

        /** customer management */
        'createdBy',
        'createdAt',
        'updatedAt'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.birthday = moment(model.birthday).format('YYYY/MM/DD');
    transformed.lastInteract = moment(model.createdAt).unix();
    transformed.createdAt = moment(model.createdAt).unix();
    transformed.updatedAt = moment(model.updatedAt).unix();
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Customer.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        /** customer attributes */
        'phones',
        'emails',
        'address',

        /** customer detail */
        'name',
        'note',
        'avatar',
        'gender',
        'birthday',
        'hashtag'
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
 * Get Customer By Id
 *
 * @public
 * @param {String} customerId
 * @param {String} userId
 */
Customer.getCustomerById = async ({ customerId, userId }) => {
    try {
        const customer = await Customer.findOne(
            {
                where: {
                    id: customerId,
                    createdBy: {
                        [Op.contains]: {
                            id: userId
                        }
                    }
                }
            }
        );
        if (!customer) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return customer;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Get Multiple Customer By Id
 *
 * @public
 * @param {String} customerId
 * @param {String} userId
 */
Customer.getCustomers = async ({ customers = [], userId }) => {
    try {
        const data = await this.find(
            {
                id: {
                    [Op.in]: customers
                },
                createdBy: {
                    [Op.contains]: {
                        id: userId
                    }
                }
            }
        );
        if (!data.length) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return data;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Generate table
 */
Customer.sync({});

/**
 * @typedef Customer
 */
export default Customer; 
-->
