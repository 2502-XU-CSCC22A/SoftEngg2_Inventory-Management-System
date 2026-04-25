import models, { sequelize } from "../config/db.js";
import _ from "lodash";

export const getValidUser = async (userId, transaction) => {
    const user = await models.users.findByPk(userId, { transaction: transaction });

    if (!user) {
        const error = new Error("User not found.");
        error.status = 404;
        throw error;
    }

    return user;
}

export const getValidProduct = async (productId, transaction) => {
    const product = await models.products.findByPk(productId, { transaction: transaction });

    if (!product) {
        const error = new Error("Product not found.");
        error.status = 404;
        throw error;
    }

    return product;
}

export const insertTransactionItem = async (productJSON, txnJSON, item, transaction) => {
    const txnItem = await models.transaction_items.create({
        transaction_id: txnJSON.transaction_id,
        product_name: productJSON.product_name,
        product_unit_price: productJSON.product_unit_price,
        ...item,
    }, { transaction: transaction })

    return txnItem;
}

export const validatePurchasedAmount = (quantityBought, availableQuantity) => {
    if (quantityBought > availableQuantity) {
        const error = new Error("Quantity purchased is higher than the available quantity of the particular product.");
        error.status = 400;
        throw error;
    } 
}

export const patchTransactionPayload = (oldPayload, patch) => {
    return { ...oldPayload, ...patch }
}

export const isPayloadIdentical = (oldPayload, newPayload) => {
    if (_.isEqual(oldPayload, newPayload)) {
        const error = new Error("Old and new payloads identical; update aborted.");
        error.status = 400;
        throw error;
    }
}