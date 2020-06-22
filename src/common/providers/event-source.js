import modelEvent from '../services/events/model-event';

export default {
    register: () => {
        modelEvent.registerAppEvent();
        modelEvent.registerCustomerEvent();
        modelEvent.registerGroupEvent();
        modelEvent.registerPointEvent();
        modelEvent.registerRankEvent();
    }
};
