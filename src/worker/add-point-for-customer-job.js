// import { ProcessEvent } from 'rabbit-event-source';
// import { differenceWith } from 'lodash';
import Queue from 'bull';
import jobs from '../config/jobs';
import redis from '../config/redis';

async function handler(job, done) {
    console.log(`done job add point: ${job.data}`);
    job.process(100);
    return done();
}

/**
 * Register job handler
 */
function register() {
    console.log('Listen to job', jobs.ADD_POINT_FOR_CUSTOMER);
    const queue = new Queue(
        jobs.ADD_POINT_FOR_CUSTOMER,
        redis.getJobOptions()
    );
    queue.process(handler);
    return queue;
}

export default { register };
