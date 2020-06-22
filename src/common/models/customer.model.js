import { mongo } from 'mongoose';
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model, Op } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';
import { isEqual, includes, values, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Customer extends Model { }

Customer.Genders = {
    MALE: 'male',
    FEMALE: 'female',
    UNKNOWN: 'unknown'
};

Customer.Sources = {
    Website: 'Website',
    Facebook: 'Facebook',
    KHACH_CU: 'Khách Cũ',
    QUA_TANG: 'Quà Tặng',
    GAN_CUA_HANG: 'Gần Cửa Hàng',
    BAN_BE_GIOI_THIEU: 'Bạn Giới Thiệu',
};

Customer.Relations = {
    DOI_TAC: 'Đối Tác',
    NHU_CAU: 'Nhu Cầu',
    CHOT_CAO: 'Chốt Cao',
    MAT_CHOT: 'Mất Chốt',
    MUC_TIEU: 'Mục Tiêu',
    TIEM_NANG: 'Tiềm Năng',
    CHAT_LUONG: 'Chất Lượng',
    THAN_THIET: 'Thân Thiết',
    BIET_DUNNIO: 'Biết Dunnio',
    THICH_DUNNIO: 'Thích Dunnio',
    TRUNG_THANH: 'Trung Thành',
    CHIA_SE: 'Chia Sẻ'
};

Customer.Ranks = {
    VIP: 'vip',
    VVIP: 'vvip'
};

Customer.Types = {
    COMPANY: 'company',
    INDIVIDUAL: 'individual'
};

/**
 * User Schema
 * @public
 */
Customer.init(
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING(50),
            values: values(Customer.Types),
            defaultValue: Customer.Types.INDIVIDUAL
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        avatar: {
            type: DataTypes.STRING(255),
            defaultValue: 'https://cdn.dunnio.com/storages/avatars/default.jpg'
        },
        cover: {
            type: DataTypes.STRING(255),
            defaultValue: 'https://cdn.dunnio.com/storages/covers/default.jpg'
        },
        images: {
            type: DataTypes.JSONB(DataTypes.STRING),
            defaultValue: []
        },
        password: {
            type: DataTypes.STRING(255),
            defaultValue: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
            validate: { isLowercase: true }
        },

        birthday: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        gender: {
            type: DataTypes.STRING(50),
            values: values(Customer.Genders),
            defaultValue: Customer.Genders.UNKNOWN
        },
        address: {
            type: DataTypes.STRING(500),
            defaultValue: null
        },
        source: {
            type: DataTypes.STRING(150),
            values: values(Customer.Sources),
            defaultValue: Customer.Sources.Website
        },
        relation: {
            type: DataTypes.STRING(150),
            values: values(Customer.Relations),
            defaultValue: Customer.Relations.TIEM_NANG
        },
        friend: {
            type: DataTypes.JSONB,
            defaultValue: null
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
        rank: {
            type: DataTypes.STRING(25),
            defaultValue: null
        },
        tax_code: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        contact: {
            type: DataTypes.STRING(155),
            defaultValue: null
        },

        total_point: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },

        setting: {
            type: DataTypes.JSONB,
            defaultValue: {
                language: 'vi'
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
    CUSTOMER_DELETED: `${serviceName}.customer.deleted`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Customer.addHook('beforeCreate', (model) => {
    const customer = model;
    customer.id = new mongo.ObjectId().toHexString();
    return customer;
});

Customer.addHook('afterCreate', (model) => {
    eventBus.emit(
        AppEvent.Events.APP_EVENT_CREATED,
        {
            source: 'customers',
            message: `${model.created_by.id} đã tạo mới khách hàng: ${model.id}`,
            user: model.created_by,
            data: model.dataValues
        }
    );
});

Customer.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

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

Customer.addHook('afterDestroy', (model, options) => {
    const { params } = options;
    /** after remove to collection */
    eventBus.emit(
        AppEvent.Events.APP_EVENT_DELETED,
        {
            source: 'customers',
            message: `${params.updated_by.id} đã xóa khách hàng: ${model.id}`,
            user: params.updated_by,
            data: model.dataValues
        }
    );
});

/**
 * Transform mongoose model to expose object
 */
Customer.transform = (model) => {
    const transformed = {};
    const fields = [
        'id',
        'type',
        'name',
        'phone',
        'email',
        'avatar',
        'cover',
        'images',

        'address',
        'birthday',
        'gender',
        'source',
        'relation',
        'friend',
        'store',
        'rank',
        'tax_code',
        'contact',

        'total_point',
        'total_order',
        'total_price',

        'setting',
        'is_active',
        'created_by',
        'updated_at',
        'created_at',
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.birthday = moment(model.birthday).unix();
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
Customer.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        'type',
        'name',
        'phone',
        'email',
        'avatar',
        'cover',
        'images',

        'birthday',
        'gender',
        'source',
        'address',
        'relation',
        'friend',
        'store',
        'tax_code',
        'contact',
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
 */
Customer.getCustomerById = async (customerId) => {
    try {
        const customer = await Customer.findByPk(customerId);
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
 * Get Customer By Data Info
 *
 * @public
 * @param {object} data email || phone
 */
Customer.getCustomerByPhoneEmail = async ({ phone, email }) => {
    try {
        let customer = null;
        if (phone) customer = await Customer.findOne({ where: { phone: phone } });
        if (email) customer = await Customer.findOne({ where: { email: email } });
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
 * Check Duplicate Account Info
 *
 * @public
 * @param {object} data phone || email
 * @param customerId break row when id === userId
 */
Customer.checkDuplicateByPhoneEmail = async ({ phone, email, customerId }) => {
    try {
        let customer = null;
        let message = null;
        if (phone) {
            customer = await Customer.findOne({
                where: {
                    phone: phone,
                    id: customerId
                        ? { [Op.ne]: customerId }
                        : { [Op.ne]: null }
                }
            });
            message = messages.PHONE_EXISTS;
        }
        if (!customer && email) {
            customer = await Customer.findOne({
                where: {
                    email: email,
                    id: customerId
                        ? { [Op.ne]: customerId }
                        : { [Op.ne]: null }
                }
            });
            message = messages.EMAIL_EXISTS;
        }

        if (customer) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: message
            });
        }

        return customer;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * @typedef Customer
 */
export default Customer;
