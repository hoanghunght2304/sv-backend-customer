import { Op } from 'sequelize';
import { handler as ErrorHandel } from './errors';
import Customer from '../../common/models/customer.model';

/**
 * Check duplicate data.
 */
exports.checkDuplicate = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        await Customer.checkDuplicateByPhoneEmail(
            Object.assign(req.body, { customerId: customerId })
        );
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
        let start; let end;
        if (params.start_time && params.end_time) {
            start = new Date(params.start_time); end = new Date(params.end_time);
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
        }

        /** setup conditions */
        const conditions = {
            is_active: true
        };
        if (params.genders) {
            conditions.gender = {
                [Op.in]: params.genders
            };
        }
        if (params.stores) {
            conditions['store.id'] = {
                [Op.in]: params.stores
            };
        }
        if (params.sources) {
            conditions.source = {
                [Op.in]: params.sources
            };
        }
        if (params.relations) {
            conditions.relation = {
                [Op.in]: params.relations
            };
        }
        if (params.ranks) {
            conditions.rank = {
                [Op.in]: params.ranks
            };
        }
        if (params.by_date === 'create' && start && end) {
            conditions.created_at = {
                [Op.gte]: start,
                [Op.lte]: end
            };
        }
        if (params.by_date === 'birthday' && start && end) {
            conditions.birthday = {
                [Op.gte]: start,
                [Op.lte]: end
            };
        }
        if (params.keyword) {
            conditions[Op.or] = [
                {
                    name: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
                {
                    email: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
                {
                    phone: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
            ];
        }
        req.conditions = conditions;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load item by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const customer = await Customer.getCustomerById(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.customer = customer;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
