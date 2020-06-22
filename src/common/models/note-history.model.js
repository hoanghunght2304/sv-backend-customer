import { DataTypes, Model } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';

import postgres from '../../config/postgres';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class BodyNoteHistory extends Model { }

/**
 * Body Note Schema
 * @public
 */
BodyNoteHistory.init(
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
            type: DataTypes.STRING(155),
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
        tableName: 'tbl_body_notes'
    }
);

BodyNoteHistory.addHook('afterCreate', (model) => {
    eventBus.emit(
        AppEvent.Events.APP_EVENT_CREATED,
        {
            source: 'metric-history',
            message: `${model.created_by.id} đã tạo mới lịch sử ghi chú cơ thể: ${model.id}`,
            user: model.created_by,
            data: model.dataValues
        }
    );
});


/**
 * Transform postgre model to expose object
 */
BodyNoteHistory.transform = (model) => {
    const transformed = {};
    model.forEach(x => {
        transformed[x.key] = x.notes;
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
BodyNoteHistory.list = async (customerId) => {
    try {
        const result = await BodyNoteHistory.sequelize.query(`
            SELECT
                m_1.key, (
                SELECT json_agg(
                    json_build_object(
                            'key', m_2.key,
                            'value', m_2.value,
                            'created_at', m_2.created_at,
                            'created_by', m_2.created_by
                        )
                    ) FROM tbl_body_note_history AS m_2
                    WHERE customer_id = '${customerId}' AND
                        m_2.key = m_1.key
                ) AS notes
            FROM tbl_body_note_history AS m_1
            WHERE customer_id = '${customerId}'
            GROUP BY m_1.key
        `);
        return result[0];
    } catch (ex) {
        throw ex;
    }
};

/**
 * @typedef BodyNoteHistory
 */
export default BodyNoteHistory;
