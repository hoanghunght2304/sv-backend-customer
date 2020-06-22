import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import MetricHistory from '../../../common/models/metric-history.model';

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
        const data = await MetricHistory.list(
            req.query.customer_id
        );
        return res.json({
            code: 0,
            data: MetricHistory.transform(data)
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Create
 *
 * @public
 * @param {MetricHistory} body
 * @permission CUSTOMER_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);

    return MetricHistory.create(req.body)
        .then((data) => {
            const fields = ['id', 'key', 'value', 'customer_id', 'is_active', 'created_by', 'created_at', 'updated_at'];
            res.json({
                code: 0,
                message: messages.CREATE_SUCCESS,
                data: pick(data, fields)
            });
        }).catch(ex => {
            ErrorHandler(ex, req, res, next);
        });
};
