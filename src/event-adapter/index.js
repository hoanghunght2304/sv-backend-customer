import customerServiceAddPointHandler from './customer_service-add-point-handler';
import customerServiceUpdateMetricHandler from './customer_service-update-metric-handler';

async function register() {
    await customerServiceAddPointHandler.register();
    await customerServiceUpdateMetricHandler.register();
}

export default { register };
