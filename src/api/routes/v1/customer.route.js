import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import controller from '../../controllers/v1/customer.controller';
import middleware from '../../middlewares/customer.middleware';
import permissions from '../../../config/permissions';
import {
    listValidation,
    createValidation,
    updateValidation,
    // updateMetricValidation,
    // updateBodyNoteValidation
} from '../../validations/v1/customer.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.CUSTOMER_LIST]),
        middleware.condition,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.CUSTOMER_CREATE]),
        middleware.checkDuplicate,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.CUSTOMER_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.CUSTOMER_UPDATE]),
        middleware.load,
        middleware.checkDuplicate,
        controller.update
    )
    .delete(
        authorize([permissions.CUSTOMER_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
