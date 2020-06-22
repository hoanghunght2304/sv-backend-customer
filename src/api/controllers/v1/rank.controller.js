import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import Rank from '../../../common/models/rank.model';

/**
 * List
 *
 * @public
 * @param query
 * @permision RANK_LIST
 * @returns {Promise<Rank[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await Rank.findAndCountAll({
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
                rank => Rank.transform(rank)
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
 * @param {Rank} body
 * @permision RANK_CREATE
 * @returns {Promise<Rank>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);
    return Rank.create(
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
            data: Rank.transform(data)
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
 * @permision RANK_DETAIL
 * @returns {Promise<Rank>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Rank.transform(req.locals.rank) });

/**
 * Update
 *
 * @public
 * @param {Rank} body
 * @permission RANK_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        user,
        rank: oldModel
    } = req.locals;
    const dataChanged = Rank.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /** replace existing item */
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();
    return Rank.update(
        params,
        {
            where: {
                id: oldModel.id
            },
            params: {
                user: pick(user, ['id', 'name']),
                customers: req.body.customers
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
 * @permission RANK_DELETE
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { rank, user } = req.locals;
        await Rank.destroy({
            where: {
                id: rank.id
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
