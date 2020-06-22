import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import Customer from '../../../common/models/customer.model';

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
        const result = await Customer.findAndCountAll({
            where: req.conditions,
            order: [
                ['name', 'ASC']
            ],
            limit: req.query.limit,
            offset: req.query.skip
        });

        return res.json({
            code: 0,
            count: result.count,
            data: result.rows.map(
                customer => Customer.transform(customer)
            )
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Create
 *
 * @public
 * @param {Customer} body
 * @permision CUSTOMER_CREATE
 * @returns {Promise<Customer>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);
    return Customer.create(req.body)
        .then((data) => {
            res.json({
                code: 0,
                message: messages.CREATE_SUCCESS,
                data: Customer.transform(data)
            });
        }).catch(ex => {
            ErrorHandler(ex, req, res, next);
        });
};

/**
 * Detail
 *
 * @public
 * @param {String} id
 * @permision CUSTOMER_DETAIL
 * @returns {Promise<Customer>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Customer.transform(req.locals.customer) });

/**
 * Update
 *
 * @public
 * @param {Customer} body
 * @permission CUSTOMER_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        user,
        customer: oldModel
    } = req.locals;
    const dataChanged = Customer.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  replace existing item */
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();
    return Customer.update(
        params,
        {
            where: {
                id: oldModel.id
            },
            params: {
                updated_by: pick(user, ['id', 'name'])
            },
            individualHooks: true
        }
    ).then(() => {
        res.json({
            code: 0,
            message: messages.UPDATE_SUCCESS
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};


/**
 * Remove
 *
 * @public
 * @param {String} id
 * @permission CUSTOMER_DELETE
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { customer, user } = req.locals;
        await Customer.destroy({
            where: {
                id: customer.id
            },
            params: {
                updated_by: pick(user, ['id', 'name'])
            },
            individualHooks: true
        });
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
