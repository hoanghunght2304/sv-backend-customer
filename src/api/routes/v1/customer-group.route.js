import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import {
    listValidation,
    createValidation,
    updateValidation
} from '../../validations/v1/customer-group.validation';
import permissions from '../../../config/permissions';

import middleware from '../../middlewares/customer-group.middleware';
import controller from '../../controllers/v1/customer-group.controller';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.CUSTOMER_GROUP_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.CUSTOMER_GROUP_CREATE]),
        middleware.checkDuplicate,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.CUSTOMER_GROUP_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.CUSTOMER_GROUP_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.CUSTOMER_GROUP_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
