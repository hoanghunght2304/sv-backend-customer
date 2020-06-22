import Joi from 'joi';
import { values } from 'lodash';
import Customer from '../../../common/models/customer.model';

const phoneRegex = /^\+?[0-9]{9,15}$/;

module.exports = {
    /** GET v1/customers */
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
            by_date: Joi.string()
                .default('create')
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, ''),
            types: Joi.array()
                .items(
                    Joi.string().only(
                        values(Customer.Types)
                    )
                )
                .allow(null, ''),
            ranks: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            stores: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            genders: Joi.array()
                .items(Joi.string()
                    .only(
                        values(Customer.Genders)
                    )
                )
                .allow(null, ''),
            sources: Joi.array()
                .items(
                    Joi.string().only(
                        values(Customer.Sources)
                    )
                )
                .allow(null, ''),
            relations: Joi.array()
                .items(
                    Joi.string().only(
                        values(Customer.Relations)
                    )
                )
                .allow(null, ''),
        }
    },

    /** POST v1/customers */
    createValidation: {
        body: {
            /** customer profile */
            type: Joi.string()
                .max(50)
                .only(values(Customer.Types))
                .allow(null, ''),
            name: Joi.string()
                .max(100)
                .required(),
            phone: Joi.string()
                .min(10)
                .max(20)
                .regex(phoneRegex)
                .required(),
            email: Joi.string()
                .max(255)
                .regex(/^\S+@\S+\.\S+$/)
                .lowercase()
                .allow(null, ''),

            avatar: Joi.string()
                .max(255)
                .allow(null, ''),
            cover: Joi.string()
                .max(255)
                .allow(null, ''),
            images: Joi.array()
                .items(Joi.string().max(255))
                .default([]),

            address: Joi.string()
                .allow(null, ''),
            birthday: Joi.date()
                .allow(null, ''),
            gender: Joi.string()
                .only(values(Customer.Genders))
                .default(Customer.Genders.FEMALE)
                .allow(null, ''),

            /** customer extra */
            source: Joi.string()
                .only(values(Customer.Sources))
                .default(Customer.Sources.Website)
                .allow(null, ''),
            relation: Joi.string()
                .only(values(Customer.Relations))
                .default(Customer.Relations.TIEM_NANG)
                .allow(null, ''),
            friend: Joi.object({
                id: Joi.string().lowercase(true).required(),
                name: Joi.string().required(),
                phone: Joi.string().required()
            }).allow(null, ''),
            store: Joi.object({
                id: Joi.string().required(),
                name: Joi.string().required(),
                phone: Joi.string().required()
            })
                .required(),
            rank: Joi.string()
                .max(25)
                .default(null),
            tax_code: Joi.number()
                .allow(null, '')
                .default(null),
            contact: Joi.string()
                .max(155)
                .allow(null, '')
                .default(null),
            total_point: Joi.number()
                .default(0)
                .allow(null, ''),
            total_order: Joi.number()
                .default(0)
                .allow(null, ''),
            total_price: Joi.number()
                .default(0)
                .allow(null, '')
        }
    },

    /** PUT v1/customers/:id */
    updateValidation: {
        body: {
            /** customer profile */
            type: Joi.string()
                .max(50)
                .only(values(Customer.Types))
                .allow(null, ''),
            name: Joi.string()
                .max(100)
                .allow(null, ''),
            phone: Joi.string()
                .min(10)
                .max(20)
                .regex(phoneRegex)
                .allow(null, ''),
            email: Joi.string()
                .max(255)
                .regex(/^\S+@\S+\.\S+$/)
                .lowercase()
                .allow(null, ''),

            avatar: Joi.string()
                .max(255)
                .allow(null, ''),
            cover: Joi.string()
                .max(255)
                .allow(null, ''),
            images: Joi.array()
                .items(Joi.string().max(255))
                .allow(null, ''),

            address: Joi.string()
                .allow(null, ''),
            birthday: Joi.date()
                .allow(null, ''),
            gender: Joi.string()
                .only(values(Customer.Genders))
                .allow(null, ''),

            /** customer extra */
            source: Joi.string()
                .only(values(Customer.Sources))
                .allow(null, ''),
            relation: Joi.string()
                .only(values(Customer.Relations))
                .allow(null, ''),
            friend: Joi.object()
                .keys({
                    id: Joi.string().lowercase(true).required(),
                    name: Joi.string().required(),
                    phone: Joi.string().required()
                })
                .allow(null, ''),
            store: Joi.object(
                {
                    id: Joi.string().required(),
                    name: Joi.string().required(),
                    phone: Joi.string().required()
                }
            )
                .allow(null, ''),
            rank: Joi.string()
                .max(25)
                .allow(null, ''),
            tax_code: Joi.number()
                .allow(null, ''),
            contact: Joi.string()
                .max(155)
                .allow(null, '')
        }
    }
};
