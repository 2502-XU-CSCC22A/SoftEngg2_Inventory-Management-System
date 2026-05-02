import { defaultValueSchemable } from "sequelize/lib/utils";
import models, { sequelize } from "../config/db.js";
import { patchTransactionPayload, isPayloadIdentical } from "../services/transactionService.js";

export const validate = (schema) => {
    return (req, res, next) => {
        const result = performValidation(schema, req.body);

        if (!result.isValid) {
            return res.status(400).json({ errors: result.errors });
        }

        req.body = result.value;
        delete req.body["operation"];
        next();
    }
}

export const performValidation = (schema, data) => {
    const { error, value } = schema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
        convert: true,
    });

    if (error) {
        return {
            isValid: false,
            errors: error.details.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        };
    }

    return {
        isValid: true,
        value: value,
        errors: null,
    }
}

export const fetchUpdateableTransaction = async (req, res, next) => {
    try {
        const txn = await models.transactions.findByPk(req.params.transactionId, {
            include: {
                model: models.transaction_items,
                as: "transaction_items",
            }
        });

        if (!txn) {
            return res.status(404).json({ message: "Transaction not found." });
        }

        const updatedPayload = patchTransactionPayload(txn.toJSON(), req.body);
        isPayloadIdentical(txn.toJSON(), updatedPayload);

        req.oldTxn = txn.toJSON();
        req.updatedPayload = updatedPayload;

        next();
    }
    catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
}

export const carvePayload = async (req, res, next) => {
    try {
        delete req.updatedPayload["transaction_id"];
        for (const item of req.updatedPayload.transaction_items) {
            delete item["transaction_id"];
            delete item["item_id"];
            delete item["product_name"];
            delete item["product_unit_price"];
        }

        req.updatedPayload["prev_txn_id"] = req.oldTxn.transaction_id;

        next();
    }
    catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
}

export const validateMonthAndYear = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and year query parameters are required." });
        }
        else if (isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ message: "Month must be a number between 1 and 12." });
        }
        else if (isNaN(year) || year < 1000 || year > 9999) {
            return res.status(400).json({ message: "Year must be a 4-digit number." });
        }

        next();
    }
    catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
}
