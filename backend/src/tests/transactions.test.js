import { vi, describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import models from '../config/db.js';
import { insertTransaction } from '../controllers/transactionsController.js';

// TODO: Write tests for updating transactions; do in feature/update-transaction branch; branch out of develop

describe('Creating a transaction via POST', () => {
    it('should return a 200/201 after a successful insert of a transaction with one item', async () => {
        const validTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(validTransaction);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("Transaction inserted successfully.");
    })

    it('should update the product quantities post-transaction correctly', async () => {
        const product = await models.products.findByPk(1); // retrieve existing product;
        const productJSON = product.toJSON();
        const productQuantity = productJSON.product_quantity;
        const quantityBought = 5;

        const validTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 1,
            items: [
                {
                    product_id: productJSON.product_id,
                    quantity_bought: quantityBought,
                }
            ]
        }

        const res = await request(app).post('/transactions').send(validTransaction);
        console.log(res.message);
        expect(res.statusCode).toEqual(200);

        const updatedProduct = await models.products.findByPk(1);
        const updatedProductJSON = updatedProduct.toJSON();
        expect(updatedProductJSON.product_quantity).toEqual(productQuantity - quantityBought);
    })

    it('should return a 200 when inserting a transaction with multiple items', async () => {
        const validTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "5432109876",
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }, 
                {
                    product_id: 2,
                    quantity_bought: 3,
                },
                {
                    product_id: 3,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(validTransaction);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("Transaction inserted successfully.");
    })

    it('should return an error when the update/insert value isn\'t in the payload', async () => {
        const invalidTransaction = {
            // missing operation key
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(invalidTransaction);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when a timestamp isn\'t included in the payload', async () => {
        const incompleteTransaction = {
            operation: "insert",
            payment_type: "GCash",
            payment_refstr: "0521678",
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }
        const res = await request(app).post('/transactions').send(incompleteTransaction);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when the payment type isn\'t included in the payload', async () => {
        const incompleteTransaction = {
            operation: "insert",
            // missing payment_type and payment_refstr
            transaction_timestamp: Date.now(),
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }
        const res = await request(app).post('/transactions').send(incompleteTransaction);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when the payment type isn\'t cash but no reference string is included', async () => {
        const invalidTransaction = { 
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            // missing payment_refstr
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(invalidTransaction);
        expect(res.statusCode).toEqual(400);
    })


    it('should return an error when the handler of the transaction isn\'t included', async () => {
        const incompleteTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            // missing created_by
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(incompleteTransaction);
        expect(res.statusCode).toEqual(400);
    })

    it ('should return an error when transaction items is not included in the transaction', async () => {
        const incompleteTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 1,
            // missing items
        }

        const res = await request(app).post('/transactions').send(incompleteTransaction);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when the referenced user is non-existent', async () => {
        const completeTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 9999,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.statusCode).toEqual(404); // user not found
    })

    it('should return an error when the referenced product is non-existent', async () => {
        const completeTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 1,
            items: [
                {
                    product_id: 999,
                    quantity_bought: 3
                }
            ]
        }

        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.statusCode).toEqual(404);
    })

    it('should return an error when the ordered quantity is bigger than available product quantity', async () => {
        const completeTransaction = {
            operation: "insert",
            transaction_timestamp: Date.now(),
            payment_type: "GCash",
            payment_refstr: "1234567",
            created_by: 1,
            items: [
                {
                    product_id: 1,
                    quantity_bought: 9999,
                }
            ]
        }
        
        const res = await request(app).post('/transactions').send(completeTransaction);
        expect(res.statusCode).toEqual(400);
    })
})