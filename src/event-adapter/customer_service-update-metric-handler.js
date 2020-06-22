import Queue from 'bull';
import { LogEvent, ProcessEvent, rabbit } from 'rabbit-event-source';
import { serviceName } from '../config/vars';
import jobs from '../config/jobs';
import redis from '../config/redis';

const { ensureBinding, subcribeQueue } = rabbit;
const listenFromService = 'dunnio_erp_service_customer';
const modelName = 'metric';
const eventType = 'update_metric';

async function eventHandler(message) {
    const { data } = message;
    // push job to redis
    try {
        const updateMetricJob = new ProcessEvent({
            eventId: message.id,
            queue: jobs.UPDATE_METRIC_FOR_CUSTOMER,
            status: ProcessEvent.Statuses.PENDING,
            data
        });
        await updateMetricJob.save();

        const updateMetricQueue = new Queue(
            jobs.UPDATE_METRIC_FOR_CUSTOMER,
            redis.getJobOptions()
        );
        updateMetricQueue.add({ id: updateMetricJob.id });
    } catch (error) {
        console.log('cannot push update metric job to redis queue');
        new LogEvent({
            code: error.code || 500,
            message: 'cannot push update metric job to redis queue',
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
