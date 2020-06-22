import { handler as ErrorHandel } from './errors';
import CustomerGroup from '../../common/models/customer-group.model';

/**
 * Check duplicate groupId.
 */
exports.checkDuplicate = async (req, res, next) => {
    try {
        await CustomerGroup.checkDuplicateGroupId(req.params.id);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};


/**
 * Load group by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const group = await CustomerGroup.getGroupById(
            req.params.id
        );
        req.locals.group = group;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load count for filter.
 */
exports.count = async (req, res, next) => {
    try {
        req.totalRecords = await CustomerGroup.countQueries(req.query);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

