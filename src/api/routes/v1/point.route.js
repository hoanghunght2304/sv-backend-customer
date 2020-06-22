import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

// import permissions from '../../../utils/permissions';
import middleware from '../../middlewares/point.middleware';
import controller from '../../controllers/v1/point.controller';
import {
    createValidation,
    listValidation
} from '../../validations/v1/point.validation';

const router = express.Router();

router
    .route('/')

    .post(
        authorize([/** PERMISION. */]),
        validate(createValidation),
        controller.create
    );

router
    .route('/:id')
    .get(
        validate(listValidation),
        authorize([/** PERMISION. */]),
        middleware.condition,
        controller.list
    )
    .delete(
        authorize([/** permissions. */]),
        middleware.load,
        controller.delete
    );
export default router;

