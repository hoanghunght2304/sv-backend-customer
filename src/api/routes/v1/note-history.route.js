import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import controller from '../../controllers/v1/note-history.controller';
import middleware from '../../middlewares/note-history.middleware';
import permissions from '../../../config/permissions';
import {
    listValidation,
    createValidation,
    deleteValidation
} from '../../validations/v1/note-history.validation';

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
        authorize([permissions.CUSTOMER_UPDATE]),
        controller.create
    );

router
    .route('/:id')
    .post(
        validate(deleteValidation),
        authorize([permissions.CUSTOMER_UPDATE]),
        controller.delete
    );

export default router;
