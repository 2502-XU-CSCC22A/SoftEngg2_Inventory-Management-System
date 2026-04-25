import Joi from 'joi';

export const insertTransactionSchema = Joi.object({
    operation: Joi.string().valid("insert").required(),
    transaction_timestamp: Joi.number().required(),
    prev_txn_id: Joi.number().positive().allow('null'),
    payment_type: Joi.string().valid("Cash", "GCash").required(),
    payment_refstr: Joi.string().allow('', 'null').when('payment_type', {
        is: Joi.valid('GCash'),
        then: Joi.string().min(1).max(255).required(),
        otherwise: Joi.allow('null', ''),
    }),
    created_by: Joi.number().required(),
    transaction_items: Joi.array().items(
        Joi.object({
            product_id: Joi.number().positive().required(),
            quantity_bought: Joi.number().positive().max(2147483647).required()
        }).unknown(false),
    ).min(1).required().unique('product_id'),
})

export const updateTransactionSchema = Joi.object({
    transaction_id: Joi.number().positive().required(),
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