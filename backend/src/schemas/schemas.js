import Joi from 'joi';

export const insertTransactionSchema = Joi.object({
    payment_type: Joi.string().valid("Cash", "GCash").required(),
    payment_refstr: Joi.string().allow('', 'null').when('payment_type', {
        is: Joi.valid('GCash'),
        then: Joi.string().min(1).max(255).required(),
        otherwise: Joi.allow('null', ''),
    }),
    transaction_items: Joi.array().items(
        Joi.object({
            product_id: Joi.number().positive().required(),
            quantity_bought: Joi.number().positive().max(2147483647).required()
        }).unknown(false),
    ).min(1).required().unique('product_id'),
})

export const updateTransactionSchema = Joi.object({
    payment_type: Joi.string().valid("Cash", "GCash"),
    payment_refstr: Joi.string()
        .allow(null, '')
        .when('payment_type', {
            is: "GCash",
            then: Joi.string().min(1).required(),
            otherwise: Joi.optional()
        }),
    transaction_items: Joi.array().items(
        Joi.object({
            product_id: Joi.number().positive().required(),
            quantity_bought: Joi.number().positive().max(2147483647).required()
        }).unknown(false)
    ).min(1).unique('product_id'),
})

export const insertProductSchema = Joi.object({
    product_name: Joi.string().max(255).required(),
    product_unit_price: Joi.number().min(1).max(2147483647).required(),
    product_quantity: Joi.number().integer().min(0).max(2147483647).required(),
    is_still_offered: Joi.boolean().required(),
}).unknown(false);

export const updateProductSchema = Joi.object({
    product_name: Joi.string().max(255),
    product_unit_price: Joi.number().min(1).max(2147483647),
    product_quantity: Joi.number().integer().min(0).max(2147483647),
    is_still_offered: Joi.boolean(),
}).min(1).unknown(false);