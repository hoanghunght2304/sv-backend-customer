import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import CustomerGroup from '../../../common/models/customer-group.model';
import CustomerGroupDetail from '../../../common/models/customer-group-detail.model';

/**
 * List
 *
 * @public
 * @param {Parameters} query
 * @permision CUSTOMER_GROUP_LIST
 * @returns {Promise<CustomerGroup[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    CustomerGroup.list(req.query).then(result => {
        res.json({
            code: 0,
            count: req.totalRecords,
            data: result.map(
                x => CustomerGroup.transform(x)
            )
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Create
 *
 * @public
 * @param {CustomerGroup} body
 * @permision CUSTOMER_GROUP_CREATE
 * @returns {Promise<CustomerGroup>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);
    return CustomerGroup.create(
        req.body,
        {
            params: {
                customers: req.body.customers
            }
        }
    ).then((data) => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: CustomerGroup.transform(data)
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
 * @permision CUSTOMER_GROUP_DETAIL
 * @returns {Promise<CustomerGroup>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: CustomerGroup.transform(req.locals.group) });

/**
 * Update
 *
 * @public
 * @param {CustomerGroup} body
 * @permission CUSTOMER_GROUP_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const { user, group: oldModel } = req.locals;
    const dataChanged = CustomerGroup.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  update existing item */
    const data = pick(req.body, dataChanged);
    data.updated_at = new Date();
    return CustomerGroup.update(
        data,
        {
            where: {
                id: oldModel.id
            },
            params: {
                user: pick(user, ['id', 'name']),
                data: {
                    old: oldModel.customers,
                    new: req.body.customers
                }
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
 * @permission CUSTOMER_GROUP_DELETE
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { user, group } = req.locals;
        await CustomerGroup.destroy({
            where: {
                id: group.id
            },
            params: {
                updated_by: pick(user, ['id', 'name'])
            },
            individualHooks: true
        });
        await CustomerGroupDetail.destroy({
            where: {
                group_id: group.id
            }
        });
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
