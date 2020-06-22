import { Router } from 'express';
import customerRoute from './customer.route';
import customerGroupRoute from './customer-group.route';
import metricHistoryRoute from './metric-history.route';
import noteHistoryRoute from './note-history.route';
import pointRoutes from './point.route';
import rankRoutes from './rank.route';
import cloneRoutes from './clone.route';

const router = Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.get('/version/:service', (req, res) => res.send(process.env.GIT_COMMIT_TAG || 'Not available'));

/**
 * API v1/customers
 */
router.use('/customers', customerRoute);

/**
 * API v1/customers
 */
router.use('/customer-group', customerGroupRoute);

/**
 * API v1/metric-history
 */
router.use('/metric-history', metricHistoryRoute);

/**
 * API v1/note-history
 */
router.use('/note-history', noteHistoryRoute);

/**
 * API v1/points
 */
router.use('/points', pointRoutes);

/*
 * API v1/ranks
 */
router.use('/ranks', rankRoutes);

/*
 * API v1/clone
 */
router.use('/clone', cloneRoutes);


export default router;
