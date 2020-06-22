import { pick } from 'lodash';
import messages from '../../../config/messages';
import Point from '../../../common/models/point.model';
import { handler as ErrorHandler } from '../../middlewares/errors';

/**
 * Create
 *
 * @public
 * @param body as Point
 * @returns {Promise<Point, APIException>}
 */
exports.create = async (req, res, next) => {
    try {
        const { user } = req.locals;
        req.body.created_by = pick(user, ['id', 'name', 'avatar']);
        const point = new Point(req.body);
        await point.save();
        return res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: Point.transform(point)
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * List
 *
 * @public
 * @param query
 * @permision POINT_LIST
 * @returns {Promise<Point[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await Point.findAndCountAll({
            where: req.conditions,
            order: [
                ['created_at', 'ASC']
            ],
            limit: req.query.limit,
            offset: req.query.skip
        });

        return res.json({
            code: 0,
            count: result.count,
            data: result.rows.map(
                point => Point.transform(point)
            )
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Delete post
 *
 * @public
 * @param {Params} id
 * @returns {Promise<Point, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { point, user } = req.locals;
        await Point.update(
            {
                is_active: false,
                updated_at: new Date()
            },
            {
                where: { id: point.id },
                params: {
                    updated_by: pick(user, ['id', 'name']),
                    updated_at: new Date()
                },
                individualHooks: true
            }
        );
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
