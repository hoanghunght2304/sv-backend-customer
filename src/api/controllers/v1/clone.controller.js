import mongose from 'mongoose';
import Customer from '../../../common/models/customer.model';
import MetricHistory from '../../../common/models/metric-history.model';

/**
 * Schema
 */
const orderSchema = mongose.model('orders', new mongose.Schema({}));

exports.cloneCustomers = async (req, res, next) => {
    try {
        const count = await orderSchema.find({}).count();
        const data = await orderSchema.aggregate([
            {
                $match: {
                    $and: [
                        {
                            _id: { $exists: true }
                        },
                        {
                            status: 6
                        }
                    ]
                }
            },
            { $sort: { date_created: -1 } },
            { $skip: 0 },
            { $limit: 1000 },
            {
                $lookup:
                {
                    from: 'customers',
                    let: { customer: '$customer_info' },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$customer.customerid'] }
                                    ]
                                },
                            }
                        }
                    ],
                    as: 'customers'
                }
            },
            {
                $project: {
                    _id: 0,
                    customers: 1,
                    order: {
                        id: '$_id',
                        store: '$store_info',
                        type: '$typeid',
                        total_cost: '$total_cost',
                        total_cost_after_discount: '$total_cost_after_discount',
                        unpaid: '$unpaid',
                        paid: '$paid',
                        created_by: {
                            id: '$created_by',
                            name: '$created_by_name'
                        }
                    }
                }
            }
        ]);

        const dataImports = [];
        const metricImports = [];
        data.forEach(x => {
            const customer = x.customers[0];
            const metric = customer.metrics;
            const checkExist = dataImports.find(
                c => c.id === customer._id
            );
            if (!checkExist) {
                /** push data customer */
                let rank = null;
                if (x.ranking === 'vip') rank = 'vip';
                if (x.ranking === 'vvip') rank = 'vvip';
                dataImports.push({
                    id: customer._id,
                    type: 'individual',
                    name: customer.display_name,
                    email: !customer.email ? null : customer.email.toLowerCase(),
                    phone: customer.phone,
                    address: customer.address,
                    birthday: customer.dob,
                    friend: null,
                    rank: rank,
                    gender: Customer.Genders.MALE,
                    relation: customer.relationship === 'Không Xác Định' ? null : customer.relationship,
                    source: Customer.Sources.Website,
                    store: {
                        id: 'DT1',
                        name: 'Duy Nguyễn ., JSC',
                        phone: '0903462039'
                    },
                    created_by: {
                        id: 'techadmin',
                        name: 'Tech Admin'
                    }
                });

                /** push metric history */
                Object.keys(metric).forEach(key => {
                    if (key === 'body_notes') return;
                    const value = metric[key];
                    const created_by = {
                        id: 'techadmin',
                        name: 'Tech Admin'
                    };
                    metricImports.push({
                        key: key,
                        value: value,
                        customer_id: customer._id,
                        created_by: created_by
                    });
                });
            }
        });

        await Customer.bulkCreate(dataImports);
        await MetricHistory.bulkCreate(metricImports);

        return res.json({
            code: 0,
            count: count,
            customers: dataImports,
            metrics: metricImports
        });
    } catch (ex) {
        console.log(ex);
        throw ex;
    }
};
