import { AppEvent, LogEvent, JobEvent } from 'rabbit-event-source';
import { differenceWith } from 'lodash';
import { Op } from 'sequelize';

import { serviceName } from '../../../config/vars';
import eventBus from './event-bus';

import Rank from '../../models/rank.model';
import Point from '../../models/point.model';
import Customer from '../../models/customer.model';
import GroupDetail from '../../models/customer-group-detail.model';
import CustomerGroup from '../../models/customer-group.model';

function registerAppEvent() {
    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_CREATED, async ({ source, data, message, user }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_CREATED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_CREATED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_UPDATED, async ({ source, data, message, user }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_UPDATED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_UPDATED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_UPDATED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_DELETED, async ({ source, data, message, user }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_DELETED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_DELETED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_DELETED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });
}

function registerGroupEvent() {
    /**
     * Add customers to group when group created.
     * @public
     * @param {CustomerGroup} model
     * @param {Customers[]} customers
     */
    eventBus.on(CustomerGroup.Events.CUSTOMER_GROUP_CREATED, async ({ model, customers = [] }) => {
        try {
            const operations = [];
            customers.map(
                x => operations.push({
                    customer_id: x.id,
                    group_id: model.id,
                    created_by: model.created_by,
                    created_at: new Date(),
                    updated_at: new Date()
                })
            );

            await GroupDetail.bulkCreate(operations);
        } catch (ex) {
            console.log(`Cannot add customers to group: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot add customers to group: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            eventBus.emit(
                AppEvent.Events.APP_EVENT_CREATED,
                {
                    source: 'customer-group',
                    message: `${model.created_by.id} đã tạo mới nhóm khách hàng: ${model.id}`,
                    user: model.created_by,
                    data: model
                }
            );
        }
    });

    /**
     * Add customers to group when group created.
     * @public
     * @param {Object} model
     * @param {Object} customer
     * @param {User} user
     */
    eventBus.on(CustomerGroup.Events.CUSTOMER_GROUP_UPDATED, async ({ model, customer, user }) => {
        try {
            if (customer.new) {
                const removed = differenceWith(
                    customer.old,
                    customer.new,
                    (x, y) => x.id === y.id
                );
                const added = differenceWith(
                    customer.new,
                    customer.old,
                    (x, y) => x.id === y.id
                );
                if (removed.length) {
                    await GroupDetail.destroy({
                        where: {
                            group_id: {
                                [Op.eq]: model.id
                            },
                            customer_id: {
                                [Op.in]: removed.map(x => x.id)
                            }
                        }
                    });
                }

                if (added.length) {
                    const operations = [];
                    added.map(x => operations.push(
                        {
                            group_id: model.id,
                            customer_id: x.id,
                            created_by: user,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    ));
                    await GroupDetail.bulkCreate(operations);
                }
            }
        } catch (ex) {
            console.log(`Cannot update customers to group: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot update customers to group: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            eventBus.emit(
                AppEvent.Events.APP_EVENT_UPDATED,
                {
                    source: 'customer-group',
                    message: `${user.id} đã cập nhật nhóm khách hàng: ${model.id}`,
                    user: user,
                    data: model
                }
            );
        }
    });
}

function registerCustomerEvent() {
    /**
     * Create event update point for customer when introduction friend || complete orders.
     * @public
     * @param {Object} data
     */
    eventBus.on(Customer.Events.UPDATE_POINT, async ({ point, customer, user }) => {
        try {
            const updatePointEvent = new JobEvent({
                source: Customer.EVENT_SOURCE,
                name: Customer.Events.UPDATE_POINT,
                data: {
                    point: point,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        phone: customer.phone
                    }
                },
                created_by: {
                    id: user.id,
                    name: user.name
                },
                created_at: new Date()
            });
            await updatePointEvent.save();
        } catch (ex) {
            console.log(`Cannot create event update point for customer: ${customer.id} - point: ${point}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create event update point for customer: ${customer.id} - point: ${point}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });
}

function registerPointEvent() {
    /**
    * Add media when post created
    *
    * @param {Post} model
    * @param {Point[]} tags
    * @param {Customer[]} media
    */
    eventBus.on(Point.Events.POINT_CREATED, async (model) => {
        try {
            if (model) {
                const point = await Point.getPointByCustomerId(model.customer_id);
                await Customer.update(
                    {
                        total_point: point[0].total_point || 0,
                        updated_at: new Date()
                    },
                    {
                        where: {
                            id: model.customer_id,
                        }
                    }
                );
            }
        } catch (ex) {
            new LogEvent({
                code: ex.code || 500,
                message: `cannot update point in customer: ${model.id}`,
                stack: ex.stack || null,
                errors: ex
            }).save();
        } finally {
            eventBus.emit(
                AppEvent.Events.APP_EVENT_UPDATED,
                {
                    source: 'customer',
                    message: `${model.created_by.id} đã cập nhật lại số diểm cho khách hàng có id là: ${model.id}`,
                    user: model.created_by,
                    data: model
                }
            );
        }
    });
}

function registerRankEvent() {
    /**
     * Add rank for customer to rank when rank created
     *
     * @param {Rank} model
     * @param {Customer[]} rank
     */
    eventBus.on(Rank.Events.RANK_CREATED, async ({ model, customers = [] }) => {
        try {
            Customer.update(
                {
                    rank: model.id,
                    updated_at: new Date()
                },
                {
                    where: {
                        is_active: true,
                        id: { [Op.in]: customers }
                    }
                }
            );
        } catch (ex) {
            console.log(`Cannot add rank: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot add rank: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            eventBus.emit(
                AppEvent.Events.APP_EVENT_CREATED,
                {
                    source: 'rank',
                    message: `${model.created_by.id} đã tạo mới rank: ${model.id}`,
                    user: model.created_by,
                    data: model
                }
            );
        }
    });

    /**
     * Update rank for customer when rank updated
     *
     * @param {User} user
     * @param {Rank} model
     * @param {Customer[]} customers
     */
    eventBus.on(Rank.Events.RANK_UPDATED, async ({ user, model, customers = [] }) => {
        try {
            const newModel = customers;
            const oldModel = await Customer.findAll({
                where: {
                    rank: model.id,
                    is_active: true
                }
            });

            /** remove rank customer */
            const removed = differenceWith(
                oldModel,
                newModel,
                (x, y) => x.id === y
            );
            if (removed) {
                await Customer.update(
                    {
                        rank: null,
                        updated_at: new Date()
                    },
                    {
                        where: {
                            id: {
                                [Op.in]: removed.map(x => x.id)
                            }
                        }
                    }
                );
            }

            /** add rank customer */
            const added = differenceWith(
                newModel,
                oldModel,
                (x, y) => x === y.id
            );
            if (added) {
                await Customer.update(
                    {
                        rank: model.id,
                        updated_at: new Date()
                    },
                    {
                        where: {
                            id: {
                                [Op.in]: added
                            }
                        }
                    }
                );
            }
        } catch (ex) {
            console.log(`Cannot update rank to customer: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot update rank to customer: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            eventBus.emit(
                AppEvent.Events.APP_EVENT_UPDATED,
                {
                    source: 'ranks',
                    message: `${user.id} đã cập nhật rank: ${model.id}`,
                    user: user,
                    data: model
                }
            );
        }
    });
}

export default {
    registerAppEvent,
    registerGroupEvent,
    registerPointEvent,
    registerRankEvent,
    registerCustomerEvent
};

