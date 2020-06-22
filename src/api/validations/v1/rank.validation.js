import Joi from 'joi';

module.exports = {
    /** GET v1/ranks */
    listValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(1)
                .max(100)
                .default(10),
            keyword: Joi.string()
                .trim()
                .allow(null, ''),
            discount: Joi.number()
                .allow(null, ''),
            by_date: Joi.string()
                .only(['create', 'update'])
                .allow(null, '')
                .default('create'),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, '')
        }
    },

    /** POST v1/ranks */
    createValidation: {
        body: {
            id: Joi.string()
                .required(),
            name: Joi.string()
                .max(25)
                .required(),
            note: Joi.string()
                .max(500)
                .default(null),
            min_price: Joi.number()
                .min(0)
                .default(0)
                .allow(null, ''),
            discount: Joi.number()
                .min(0)
                .default(0)
                .allow(null, ''),
            customers: Joi.array()
                .items(Joi.string())
                .allow(null, '')
        }
    },

    /** PUT v1/ranks/:id */
    updateValidation: {
        body: {
            name: Joi.string()
                .max(25)
                .allow(null, ''),
            note: Joi.string()
                .max(500)
                .allow(null, ''),
            min_price: Joi.number()
                .allow(null, ''),
            discount: Joi.number()
                .allow(null, ''),
            customers: Joi.array()
                .items(Joi.string())
                .allow(null, '')
        }
    }
};
