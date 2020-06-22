import Joi from 'joi';

module.exports = {
    // GET v1/customer-group
    listValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(1)
                .max(1000)
                .default(20),
            keyword: Joi.string()
                .trim()
                .allow(null, ''),
            stores: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, '')
        }
    },

    // POST v1/customer-group
    createValidation: {
        body: {
            /** group attributes */
            name: Joi.string()
                .max(100)
                .required(),
            store: Joi.object(
                {
                    id: Joi.string()
                        .required(),
                    name: Joi.string()
                        .required(),
                    phone: Joi.string()
                        .required()
                }
            ).required(),
            note: Joi.string()
                .max(255)
                .required(),
            customers: Joi.array()
                .items(
                    {
                        id: Joi.string()
                            .required(),
                        name: Joi.string()
                            .required(),
                        phone: Joi.string()
                            .required(),
                        email: Joi.string()
                            .default(null, '')
                            .allow(null, ''),
                        birthday: Joi.date()
                            .default(null, '')
                            .allow(null, '')
                    }
                ).required()
        }
    },

    // PUT v1/customer-group/:id
    updateValidation: {
        body: {
            /** group info */
            name: Joi.string()
                .min(1)
                .max(100),
            note: Joi.string()
                .min(1)
                .max(255),
            customers: Joi.array()
                .items(
                    {
                        id: Joi.string()
                            .required(),
                        name: Joi.string()
                            .allow(null, ''),
                        phone: Joi.string()
                            .allow(null, ''),
                        email: Joi.string()
                            .allow(null, ''),
                        birthday: Joi.date()
                            .allow(null, '')
                    }
                ).allow(null, ''),
            store: Joi.object(
                {
                    id: Joi.string()
                        .required(),
                    name: Joi.string()
                        .required(),
                    phone: Joi.string()
                        .required()
                }
            ).allow(null, ''),
        }
    }
};
