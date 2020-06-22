import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import controller from '../../controllers/v1/metric-history.controller';
import middleware from '../../middlewares/metric-history.middleware';
import permissions from '../../../config/permissions';
import {
    listValidation,
    createValidation,
} from '../../validations/v1/metric-history.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.CUSTOMER_UPDATE]),
        middleware.condition,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.CUSTOMER_UPDATE]),
        controller.create
    );

export default router;
