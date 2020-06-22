import express from 'express';
import controller from '../../controllers/v1/clone.controller';

const router = express.Router();

router
    .route('/')
    .get(
        controller.cloneCustomers
    );

export default router;
