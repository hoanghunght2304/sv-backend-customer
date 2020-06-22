import Queue from 'bull';
import { LogEvent, ProcessEvent, rabbit } from 'rabbit-event-source';
import { serviceName } from '../config/vars';
import jobs from '../config/jobs';
import redis from '../config/redis';

const { ensureBinding, subcribeQueue } = rabbit;
const listenFromService = 'dunnio_erp_service_customer';
const modelName = 'customer';
const eventType = 'update_point';

async function eventHandler(message) {
    const { data } = message;
    // push job to redisx
    try {
        const addPointJob = new ProcessEvent({
            eventId: message.id,
            queue: jobs.ADD_POINT_FOR_CUSTOMER,
            status: ProcessEvent.Statuses.PENDING,
            data
        });
        await addPointJob.save();

        const addPointQueue = new Queue(jobs.ADD_POINT_FOR_CUSTOMER, redis.getJobOptions());
        addPointQueue.add({ id: addPointJob.id });
    } catch (error) {
        console.log('cannot push add point job to queue');
        new LogEvent({
            code: error.code || 500,
            message: 'cannot push add point job to queue',
            errors: error.errors || null
        }).save();
    }
}

async function register() {
    const queueName = `${serviceName}-${listenFromService}-${modelName}-${eventType}`;
    await ensureBinding(
        `${listenFromService}.${modelName}`,
        queueName,
        `${listenFromService}.${modelName}.${eventType}`,
        'topic'
    );

    return subcribeQueue(queueName, eventHandler);
}

export default { register };
