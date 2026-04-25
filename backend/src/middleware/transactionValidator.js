const requiredInsertFields = ["transaction_timestamp", "payment_type", "created_by", "items"];
const requiredUpdateFields = [...requiredInsertFields, "prev_txn_id", "voided_at"];

export const containsOperation = (payload) => {
    if (payload["operation"] === undefined) {
        return false;
    }
    return true;
}

export const isValidUpdatePayload = (payload) => {
    if (payload["operation"] === "update") {
        return true;
    }
    return false;
}

export const checkPaymentType = (payload) => {
    if (payload["payment_type"] === "GCash" && payload["payment_refstr"] === undefined) {
        return false;
    }
    return true;
}

export const containsRequiredInsertFields = (payloadKeys) => {
    const filteredKeys = requiredInsertFields.filter(key => !payloadKeys.includes(key))

    if (filteredKeys.length > 0) {
        return false;
    }
    return true;
}

export const containsRequiredUpdateFields = (payloadKeys) => {
    if (containsRequiredInsertFields && payloadKeys.includes("prev_txn_id") && payloadKeys.includes("voided_at")) {
        return true;
    }
    return false;
}