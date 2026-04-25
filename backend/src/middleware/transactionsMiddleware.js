import { containsInvalidKeys, validatePayloadDataTypes } from "./payloadValidator.js";
import { checkPaymentType, containsOperation, containsRequiredInsertFields, containsRequiredUpdateFields } from "./transactionValidator.js"

export const validateTransaction = (schema) => {
    return (req, res, next) => {
        const payloadKeys = Object.keys(req.body);
        const schemaKeys = Object.keys(schema);

        if (!containsOperation(req.body)) {
            return res.status(400).json({ message: "operation key not found in payload." });
        }

        if (!containsInvalidKeys(payloadKeys, schemaKeys)) {
            return res.status(400).json({ message: "Invalid fields detected." });
        }

        if (req.body["operation"] === "insert" && !containsRequiredInsertFields(payloadKeys)) {
            return res.status(400).json({ message: "Please include all necessary fields for inserts."});
        }

        if (req.body["operation"] === "update" && !containsRequiredUpdateFields(payloadKeys)) {
            return res.status(400).json({ message: "Please include all necessary fields for updates." });
        }

        if (!checkPaymentType(req.body)) {
            return res.status(400).json({ message: "Please make sure to provide the reference string for GCash payments."});
        }

        if (!validatePayloadDataTypes(req.body, payloadKeys, schema)) {
            return res.status(400).json({ message: "Please make sure to provide the correct data types for the payload."});
        }

        delete req.body["operation"];
        next();
    }
}