import { vi, describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import models from '../config/db.js';
import { insertTransaction } from '../controllers/transactionsController.js';
import { createTransaction, createUpdatePayload } from './generators/transactionFactory.js';
import { create } from 'lodash';
import { performValidation } from '../middleware/transactionsMiddleware.js';
import { insertTransactionSchema, updateTransactionSchema } from '../schemas/schemas.js';
import transaction_items from '../models/transaction_items.js';
import { createProduct } from './generators/productFactory.js';
import { isPayloadIdentical, validatePurchasedAmount } from '../services/transactionService.js';
import { invalid, valid } from 'joi';

// TODO: Write tests for updating transactions; do in feature/update-transaction branch; branch out of develop

describe('UNIT TESTS: validating a payload for inserting transactions', async () => {
    it('should accept a valid payload with GCash as payment method', async () => {
        const validTransaction = createTransaction();
        const result = performValidation(insertTransactionSchema, validTransaction);
        expect(result.isValid).toEqual(true);
    })

    it('should reject a payload without a timestamp provided', async () => {
        const invalidTransaction = createTransaction();
        delete invalidTransaction["transaction_timestamp"];

        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload with GCash as payment method but no reference number', async () => {
        const invalidTransaction = createTransaction({ payment_refstr: null });
        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when the payment type is not available', async () => {
        const invalidTransaction = createTransaction();
        delete invalidTransaction["payment_type"];

        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when the insert/update payload is not available', async () => {
        const invalidTransaction = createTransaction();
        delete invalidTransaction["operation"];

        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when created_by is missing', async () => {
        const invalidTransaction = createTransaction();
        delete invalidTransaction["created_by"];

        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when it does not include transaction items', async () => {
        const invalidTransaction = createTransaction();
        delete invalidTransaction["transaction_items"];

        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when quantity of purchased product is zero', async () => {
        const invalidTransaction = createTransaction({
            transaction_items: [
                {
                    product_id: 1,
                    product_quantity: 0,
                }
            ]
        })
        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when quantity of purchased product is less than zero', async () => {
        const invalidTransaction = createTransaction({
            transaction_items: [
                {
                    product_id: 1,
                    product_quantity: -1,
                }
            ]
        })
        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })

    it('should reject a payload when duplicate items are detected', async () => {
        const invalidTransaction = createTransaction({
            transaction_items: [
                {
                    product_id: 1,
                    product_quantity: 5,
                },
                {
                    product_id: 1,
                    product_quantity: 6,
                }
            ]
        })

        const result = performValidation(insertTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })
})

describe('UNIT TESTS: validating a payload for updating transactions', async () => {
    it('should reject an update when inserted data is the same', async () => {
        const validUpdate = createUpdatePayload({ transaction_items: [
            {
                product_id: 1,
                quantity_bought: 5,
            },
            {
                product_id: 2,
                quantity_bought: 6
            }
        ]})
        const dupTransaction = {
            ...validUpdate,
        };

        expect(() => isPayloadIdentical(validUpdate, dupTransaction)).toThrow("Old and new payloads identical; update aborted.");
    })

    it('should reject an update when transaction id isn\'t provided', async () => {
        const invalidUpdate = createUpdatePayload();
        delete invalidUpdate["transaction_id"];

        const result = performValidation(updateTransactionSchema, invalidUpdate);
        expect(result.isValid).toEqual(false);
    })

    it('should reject an update when payment type is GCash but no reference string is provided', async () => {
        const invalidUpdate = createTransaction();
        delete invalidUpdate["payment_refstr"];

        const result = performValidation(updateTransactionSchema, invalidUpdate);
        expect(result.isValid).toEqual(false);
    })

    it('should allow an update when transaction items is not provided', async () => {
        const invalidUpdate = createTransaction();
        delete invalidUpdate["transaction_items"];

        const result = performValidation(updateTransactionSchema, invalidUpdate);
        expect(result.isValid).toEqual(false);
    })

    it('should reject an update when provided transaction items contain duplicate products', async () => {
        const invalidTransaction = createTransaction({
            transaction_items: [
                {
                    product_id: 1,
                    product_quantity: 5,
                },
                {
                    product_id: 1,
                    product_quantity: 6,
                }
            ]
        })

        const result = performValidation(updateTransactionSchema, invalidTransaction);
        expect(result.isValid).toEqual(false);
    })
})

describe("UNIT TESTS - transaction business logic", async () => {
    it('should throw an error when purchased quantity is higher than available quantity', async () => {
        const product = createProduct();
        expect(() => validatePurchasedAmount(9999, product.product_quantity)).toThrow("Quantity purchased is higher than the available quantity of the particular product.");
    })
})

describe('INTEGRATION TESTS: inserting a transaction', () => {
    it('should update the product quantities post-transaction correctly', async () => {
        const product = await models.products.findByPk(1); // retrieve existing product;
        const productQuantity = product.product_quantity;
        const quantityBought = 5;

        const validTransaction = createTransaction({ transaction_items: [
            {
                product_id: product.product_id,
                quantity_bought: quantityBought,
            }
        ] })

        const res = await request(app).post('/transactions').send(validTransaction);
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual("Transaction inserted successfully.");

        const refetchedProduct = await models.products.findByPk(1);
        expect(refetchedProduct.product_quantity).toEqual(productQuantity - quantityBought);
    })

    it('should return an error when the referenced user is non-existent', async () => {
        const completeTransaction = createTransaction({ created_by: 9999 });

        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.body.message).toEqual("User not found.");
        expect(res.statusCode).toEqual(404); // user not found
    })

    it('should return an error when transaction items is not provided', async () => {
        const completeTransaction = createTransaction({ transaction_items: null });
        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when the referenced product is non-existent', async () => {
        const completeTransaction = createTransaction({ transaction_items: [
            {
                product_id: 999,
                quantity_bought: 3,
            }
        ]})

        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.body.message).toEqual("Product not found.");
        expect(res.statusCode).toEqual(404);
    })

    it('should return an error when ordered quantity is greater than available quantity', async () => {
        const completeTransaction = createTransaction({ transaction_items: [
            {
                product_id: 1,
                quantity_bought: 999,
            }
        ]})

        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.body.message).toEqual("Quantity purchased is higher than the available quantity of the particular product.")
        expect(res.statusCode).toEqual(400);
    })

    it('should rollback the transaction once an error has occurred', async () => {
        const product = await models.products.findByPk(1);
        const availableQuantity = product.product_quantity;

        const completeTransaction = createTransaction({ transaction_items: [
            {
                product_id: 1, 
                quantity_bought: 7,
            },
            {
                product_id: 999,
                quantity_bought: 10,
            }
        ]})

        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.statusCode).toEqual(404);

        const refetchedProduct = await models.products.findByPk(1);
        expect(refetchedProduct.product_quantity).toEqual(availableQuantity);
    })
})

describe('INTEGRATION TESTS: updating an existing transaction', () => {
    it('should store the previous transaction\'s id in prev_txn_id', async () => {
        const cleanTransaction = createTransaction();
        const res = await request(app).post('/transactions').send(cleanTransaction);
        const txn = await models.transactions.findByPk(1);

        expect(res.statusCode).toEqual(201);

        const patch = {
            transaction_id: res.body.data.transaction_id,
            payment_refstr: "9876543210",
        }

        const res2 = await request(app).patch(`/transactions/${res.body.data.transaction_id}`).send(patch);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.data.prev_txn_id).toEqual(res.body.data.transaction_id);
    })

    it('should store the timestamp of when the old transaction was voided', async () => {
        const cleanTransaction = createTransaction();
        const res = await request(app).post('/transactions').send(cleanTransaction);
        const txn = await models.transactions.findByPk(1);

        expect(res.statusCode).toEqual(201);

        const patch = {
            transaction_id: res.body.data.transaction_id,
            payment_refstr: "9876543210",
        }

        const res2 = await request(app).patch(`/transactions/${res.body.data.transaction_id}`).send(patch);
        expect(res2.statusCode).toEqual(200);
        
        const txn1 = await models.transactions.findByPk(1);
        expect(txn1.toJSON()).toBeTruthy;
    })

    it('should correctly calculate product quantities after rollback and re-recording', async () => {
        const p1 = await models.products.findByPk(1);
        const p2 = await models.products.findByPk(2);
        const p3 = await models.products.findByPk(3);

        const q1 = p1.product_quantity;
        const q2 = p2.product_quantity;
        const q3 = p3.product_quantity;

        const qb = [5, 10, 15];

        const nqb = [3, 2, 1];
        
        const cleanTransaction = createTransaction({
            transaction_items: [
                {
                    product_id: 1,
                    quantity_bought: qb[0],
                },
                {
                    product_id: 2,
                    quantity_bought: qb[1],
                },
                {
                    product_id: 3,
                    quantity_bought: qb[2],
                }
            ]
        })

        const res = await request(app).post('/transactions').send(cleanTransaction);
        expect(res.statusCode).toEqual(201);

        const patch = createUpdatePayload({
            transaction_items: [
                {
                    product_id: 1,
                    quantity_bought: nqb[0],
                },
                {
                    product_id: 2,
                    quantity_bought: nqb[1],
                },
                {
                    product_id: 3,
                    quantity_bought: nqb[2],
                }
            ]
        })
  
        const res2 = await request(app).patch(`/transactions/${res.body.data.transaction_id}`).send(patch);
        expect(res2.statusCode).toEqual(200);

        const rp1 = await models.products.findByPk(1);
        const rp2 = await models.products.findByPk(2);
        const rp3 = await models.products.findByPk(3);

        expect(rp1.product_quantity).toEqual(q1 - nqb[0]);
        expect(rp2.product_quantity).toEqual(q2 - nqb[1]);
        expect(rp3.product_quantity).toEqual(q3 - nqb[2]);
    })

    it('should reject empty payload', async () => {
        const validTransaction = createTransaction();
        const res = await request(app).post('/transactions').send(validTransaction);

        const patch = {};

        const res2 = await request(app).patch(`/transactions/${res.body.data.transaction_id}`).send(patch);
        expect(res2.statusCode).toEqual(400);
    })

    it('should reject a patch payload that changes nothing in the original data', async () => {
        const validTransaction = createTransaction();
        const res = await request(app).post('/transactions').send(validTransaction);

        const patch = {
            payment_type: validTransaction.payment_type,
            payment_refstr: validTransaction.payment_refstr,
        }

        const res2 = await request(app).patch(`/transactions/${res.body.data.transaction_id}`).send(patch);
        expect(res2.statusCode).toEqual(400);
    })
})