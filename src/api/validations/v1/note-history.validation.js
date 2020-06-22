import Joi from 'joi';


module.exports = {
    /** GET: /v1/note-history */
    listValidation: {
        query: {
            customer_id: Joi.string()
                .required()
                .max(50)
        }
    },

    /** POST: /v1/note-history */
    createValidation: {
        body: {
            key: Joi.string()
                .required()
                .max(100),
            customer_id: Joi.string()
                .required()
                .max(50),
            values: Joi.array()
                .items(Joi.string())
                .required()
                .max(20),
        }
    },

    /** DELETE: /v1/note-history */
    deleteValidation: {
        body: {
            customer_id: Joi.string()
                .required()
                .max(50),
            values: Joi.array()
                .items(Joi.string())
                .required()
                .max(20),
        }
    }
};
