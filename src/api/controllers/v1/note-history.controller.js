import { pick } from 'lodash';
import { Op } from 'sequelize';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import NoteHistory from '../../../common/models/note-history.model';

/**
 * List
 *
 * @public
 * @param query
 * @permision CUSTOMER_LIST
 * @returns {Promise<Customer[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const data = await NoteHistory.list(
            req.query.customer_id
        );
        return res.json({
            code: 0,
            data: NoteHistory.transform(data)
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Create
 *
 * @public
 * @param {NoteHistory} body
 * @permission CUSTOMER_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    const { key, customer_id, values } = req.body;
    const operations = [];
    values.map(
        value => operations.push({
            key: key,
            value: value,
            customer_id: customer_id,
            created_by: pick(user, ['id', 'name']),
            created_at: new Date(),
            updated_at: new Date()
        })
    );

    return NoteHistory.bulkCreate(
        operations
    ).then(() => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};


/**
 * Delete
 *
 * @public
 * @param {NoteHistory} body
 * @permission CUSTOMER_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    const { values, customer_id } = req.body;
    return NoteHistory.destroy({
        where: {
            key: req.params.id,
            customer_id: customer_id,
            value: { [Op.in]: values }
        }
    }).then(() => {
        res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};
