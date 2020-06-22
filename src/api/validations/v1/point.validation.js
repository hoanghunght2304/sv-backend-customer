import Joi from 'joi';

module.exports = {
    /** POST /v1/notes */
    createValidation: {
        body: {
            customer_id: Joi.string()
                .max(50)
                .required(true),
            transaction_id: Joi.string()
                .max(50)
                .default(null),
            value: Joi.number()
                .default(0),
            point: Joi.number()
                .required(true),
            address: Joi.string()
                .max(155)
                .default(null)
                .allow(null, ''),
            note: Joi.string()
                .max(255)
                .default(null)
                .allow(null, ''),
        }
    },
    listValidation: {
        skip: Joi.number()
            .min(0)
            .default(0),
        limit: Joi.number()
            .min(1)
            .max(1000)
            .default(20),
        transaction_id: Joi.string()
            .max(50)
            .allow(null, ''),
    }
};
