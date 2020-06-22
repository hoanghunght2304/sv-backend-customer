import { DataTypes, Model } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';

import postgres from '../../config/postgres';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class MetricHistory extends Model { }

/**
 * Metric History Schema
 * @public
 */
MetricHistory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        customer_id: {
            type: DataTypes.STRING(50),
            allowNull: false
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
        tableName: 'tbl_metrics'
    }
);

MetricHistory.addHook('afterCreate', (model) => {
    eventBus.emit(
        AppEvent.Events.APP_EVENT_CREATED,
        {
            source: 'metric-history',
            message: `${model.created_by.id} đã tạo mới lịch sử số liệu: ${model.id}`,
            user: model.created_by,
            data: model.dataValues
        }
    );
});


/**
 * Transform list postgre model to expose object
 */
MetricHistory.transform = (model = []) => {
    const transformed = {};
    model.forEach(x => {
        transformed[x.key] = x.metrics;
        transformed[x.key].sort((a, b) => {
            const contentA = new Date(a.created_at).getTime();
            const contentB = new Date(b.created_at).getTime();
            return contentB - contentA;
        });
    });
    return transformed;
};


/**
 * List history
 *
 * @public
 * @param {String} customerId
 */
MetricHistory.list = async (customerId) => {
    try {
        const result = await MetricHistory.sequelize.query(`
            SELECT
                m_1.key, (
                SELECT json_agg(
                    json_build_object(
                            'key', m_2.key,
                            'value', m_2.value,
                            'created_at', m_2.created_at,
                            'created_by', m_2.created_by
                        )
                    ) FROM tbl_metric_history AS m_2
                    WHERE 
                        customer_id = '${customerId}' AND
                        m_2.key = m_1.key
                ) AS metrics
            FROM tbl_metric_history AS m_1
            WHERE customer_id = '${customerId}'
            GROUP BY m_1.key
        `);
        return result[0];
    } catch (ex) {
        throw ex;
    }
};

/**
 * @typedef MetricHistory
 */
export default MetricHistory;
