import { Op } from 'sequelize';
import { handler as ErrorHandel } from './errors';
import Rank from '../../common/models/rank.model';

/**
 * Load filter conditions append to req.
 */
exports.condition = (req, res, next) => {
    try {
        const params = !req.query ? {} : req.query;

        let start; let end;
        if (params.start_time && params.end_time) {
            start = new Date(params.start_time); end = new Date(params.end_time);
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
        }

        /** setup conditions */
        const conditions = {
            is_active: true
        };
        if (params.keyword) {
            conditions[Op.or] = [
                {
                    id: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
                {
                    name: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
            ];
        }
        if (params.discount !== undefined) {
            conditions.discount = params.discount;
        }

        if (params.by_date === 'create' && start && end) {
            conditions.created_at = {
                [Op.gte]: start,
                [Op.lte]: end
            };
        }
        if (params.by_date === 'update' && start && end) {
            conditions.updated_at = {
                [Op.gte]: start,
                [Op.lte]: end
            };
        }

        req.conditions = conditions;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Check duplicate id.
 */
exports.checkDuplicateById = async (req, res, next) => {
    try {
        await Rank.checkDuplicateById(req.body.id || req.body._id);
        return next();
    } catch (ex) {
        throw ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load item by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const rank = await Rank.getRankById(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.rank = rank;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
