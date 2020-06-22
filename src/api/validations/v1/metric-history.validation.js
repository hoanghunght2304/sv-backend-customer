import Joi from 'joi';


module.exports = {
    /** GET:  */
    listValidation: {
        query: {
            customer_id: Joi.string()
                .required()
                .max(50)
        }
    },

    /** POST: */
    createValidation: {
        body: {
            key: Joi.string()
                .required()
                .max(100),
            value: Joi.string()
                .required()
                .max(20),
            customer_id: Joi.string()
                .required()
                .max(50)
        }
    }
};
