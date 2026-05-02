import { containsInvalidKeys, isPayloadComplete, validatePayloadDataTypes, validateValueConstraints } from "./payloadValidator.js";

export const validateAddPayload = (schema) => {
  return (req, res, next) => {
    const payloadKeys = Object.keys(req.body);
    const schemaKeys = Object.keys(schema);
    
    if (!containsInvalidKeys(payloadKeys, schemaKeys)) {
        return res.status(400).json({ message: `Invalid fields detected.` })
    }
    if (!isPayloadComplete(payloadKeys, schemaKeys)) {
        return res.status(400).json({ message: `Missing required fields.`});
    }
    if (!validatePayloadDataTypes(req.body, payloadKeys, schema)) {
        return res.status(400).json({ message: "Invalid data types for values."});
    }
    if (!validateValueConstraints(req.body, payloadKeys, schema)) {
        return res.status(400).json({ message: "Data outside boundaries."});
    }

    next();
  }
}