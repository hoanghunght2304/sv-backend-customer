import { DataTypes, Model } from 'sequelize';

import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class GroupDetail extends Model { }

/**
 * Customer Group Detail Schema
 * @public
 */
GroupDetail.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        group_id: {
            type: DataTypes.INTEGER,
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
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        tableName: 'tbl_group_details'
    }
);

/**
 * @typedef GroupDetail
 */
export default GroupDetail;
