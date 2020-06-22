import { Op } from 'sequelize';
import { handler as ErrorHandel } from './errors';
import Point from '../../common/models/point.model';
/**
 * Load item by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const point = await Point.getPointById(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.point = point;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load filter conditions append to req.
 */

exports.condition = (req, res, next) => {
    try {
        const params = !req.query ? {} : req.query;

        /** setup conditions */
        const conditions = {
            is_active: true,
            customer_id: {
                [Op.eq]: req.params.id,
            }
        };
        if (params.transactionId) {
            conditions.transaction_id = {
                [Op.iLike]: `%${params.transactionId}%`
            };
        }
        req.conditions = conditions;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
