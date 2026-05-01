import { containsInvalidKeys, isPayloadComplete, validatePayloadDataTypes, validateValueConstraints } from "./payloadValidator.js";

export const validate = (schema) => {
    return (req, res, next) => {
        const result = performValidation(schema, req.body);

        if (!result.isValid) {
            return res.status(400).json({ errors: result.errors });
        }

        req.body = result.value;
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

export const checkValidQuery = () => {
    return (req, res, next) => {
        const { name } = req.query;
        const trimmedName = name ? name.trim() : null;
        if (!trimmedName) {
            return res.status(400).json({ message: "Query parameter 'name' is required." });
        }
        if (trimmedName.length > 255) {
            return res.status(400).json({ message: "Query parameter 'name' is too long." });
        }
        if (trimmedName.length < 2) {
            return res.status(400).json({ message: "Query parameter 'name' is too short." });
        }
        next();
    }
}