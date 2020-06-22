import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import controller from '../../controllers/v1/rank.controller';
import middleware from '../../middlewares/rank.middleware';
import permissions from '../../../config/permissions';
import {
    listValidation,
    createValidation,
    updateValidation
} from '../../validations/v1/rank.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.RANK_LIST]),
        middleware.condition,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.RANK_CREATE]),
        middleware.checkDuplicateById,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.RANK_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.RANK_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.RANK_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
