export const createTransaction = (overrides = {}) => ({
    operation: "insert",
    transaction_timestamp: Date.now(),
    payment_type: "GCash",
    payment_refstr: Math.random().toString(), // Randomize to avoid DB unique constraints
    created_by: 1,
    transaction_items: [{ product_id: 1, quantity_bought: 1 }],
    ...overrides // Overwrites any of the above
});

export const createUpdatePayload = (overrides = {}) => ({
    transaction_id: 1,
    ...overrides
})