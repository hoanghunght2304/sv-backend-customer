import { DataTypes, Model } from 'sequelize';

import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class DeliveryAddress extends Model { }

/**
 * Customer Delivery Schema
 * @public
 */
DeliveryAddress.init(
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
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        customer_id: {
            type: DataTypes.STRING(50),
            allowNull: false
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
        tableName: 'tbl_address'
    }
);

/**
 * @typedef DeliveryAddress
 */
export default DeliveryAddress;
