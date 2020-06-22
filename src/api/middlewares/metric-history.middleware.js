import { handler as ErrorHandel } from './errors';


/**
 * Load filter conditions append to req.
 */
exports.condition = (req, res, next) => {
    try {
        const params = !req.query ? {} : req.query;

        /** setup conditions */
        const conditions = {
            is_active: true,
            customer_id: params.customer_id
        };
        req.conditions = conditions;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
