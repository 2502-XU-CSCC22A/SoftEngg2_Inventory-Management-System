import { containsInvalidKeys, isPayloadComplete, validatePayloadDataTypes, validateValueConstraints } from "./payloadValidator.js";

export const validateLoginPayload = (schema) => {
  return (req, res, next) => {
    const payloadKeys = Object.keys(req.body);
    const schemaKeys = Object.keys(schema);
    
    if (!isPayloadComplete(payloadKeys, schemaKeys)) {
      return res.status(400).json({ message: `Missing required fields.`});
    }
    if (!containsInvalidKeys(payloadKeys, schemaKeys)) {
      return res.status(400).json({ message: `Invalid fields detected.` })
    }
    if (!validatePayloadDataTypes(req.body, payloadKeys, schema)) {
      return res.status(400).json({ message: "Invalid data types for values."});
    }

    next();
  }
}

export const authenticateUser = (req, res, next) => {
  if (!req.session.user) {
    return res.sendStatus(401);
  }

  req.user = req.session.user;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin){
    return res.status(403).json({
      error:"Unauthorized. Admin only"
    })
  }
  next();
}