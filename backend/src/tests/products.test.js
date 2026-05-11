import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Products API', () => {
    it('should insert a product successfully', async () => {
        const completeProduct = {
            product_name: "Tarpaulin 5 x 5",
            product_unit_price: 15000,
            product_quantity: 100,
            is_still_offered: true
        }

        const res = await request(app).post('/products').send(completeProduct);
        expect(res.statusCode).toEqual(200);
    })
    //negative path tests

    // CREATE
    it('should return an error when adding a product with missing fields', async () => {
        const incompleteProduct = {
            product_name: "Incomplete Product",
            product_unit_price: 100000,
        };
        const res = await request(app).post('/products').send(incompleteProduct);
        expect(res.statusCode).toEqual(400);
        // expect(res.body.message).toEqual("All fields are required.");
    });

    it('should return an error when adding a product with invalid data types', async () => {
        const invalidProduct = {
            product_name: "Invalid Product",
            product_unit_price: "Fake number",
            product_quantity: "Fake number",
            is_still_offered: "Not a boolean"
        };
        const res = await request(app).post('/products').send(invalidProduct);
        expect(res.statusCode).toEqual(400);
        // expect(res.body.message).toEqual("Invalid data types provided.");
    });

    it('should return an error when adding a product using non-existent fields', async () => {
        const fakeProduct = {
            not_a_name: "Fake Product",
            not_a_price: 123456,
            not_a_quantity: 78910,
            not_a_boolean: true
        }
        const res = await request(app).post('/products').send(fakeProduct);
        expect(res.statusCode).toEqual(400);
        // expect(res.body.message).toEqual("Error adding product.");
    })

    it('should return an error when adding a product with a product name more than 255 characters', async () => {
        const weirdProduct = {
            product_name: "a".repeat(300),
            product_unit_price: 15000,
            product_quantity: 100,
            is_still_offered: true
        }
        const res = await request(app).post('/products').send(weirdProduct);
        expect(res.statusCode).toEqual(400)
    })

    it('should return an error when adding a product with a numeric value higher than INT limit (2,147,483,647)', async () => {
        const weirdProduct = {
            product_name: "Weird Product",
            product_unit_price: 3000000000,
            product_quantity: 3000000000,
            is_still_offered: true
        }
        const res = await request(app).post('/products').send(weirdProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when adding a product with 0 as price', async () => {
        const weirdProduct = {
            product_name: "Weird Product",
            product_unit_price: 0,
            product_quantity: 0,
            is_still_offered: true,
        }
        const res = await request(app).post('/products').send(weirdProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when adding a product with negative numeric values', async () => {
        const weirdProduct = {
            product_name: "Weird Product",
            product_unit_price: -100,
            product_quantity: -100,
            is_still_offered: true,
        }
        const res = await request(app).post('/products').send(weirdProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when adding an empty product', async () => {
        const emptyProduct = {}
        const res = await request(app).post('/products').send(emptyProduct);
        expect(res.statusCode).toEqual(400);
    })
    // UPDATE

    it('should update a product\'s name successfully', async () => {
        const name = {
            product_name: "High Quality Tarpaulin 5 x 5"
        }
        const res = await request(app).patch('/products/1').send(name);
        expect(res.statusCode).toEqual(200);
    })

    it('should update a product\'s unit price successfully', async () => {
        const price = {
            product_unit_price: 17500
        }
        const res = await request(app).patch('/products/1').send(price);
        expect(res.statusCode).toEqual(200);
    })

    it('should update a product\'s quantity successfully', async () => {
        const quantity = {
            product_quantity: 17500
        }
        const res = await request(app).patch('/products/1').send(quantity);
        expect(res.statusCode).toEqual(200);
    })

    it('should flag a product as not offered successfully', async () => {
        const status = {
            is_still_offered: false,
        }
        const res = await request(app).patch('/products/1').send(status);
        expect(res.statusCode).toEqual(200);
    })

    it('should return an error when updating product with invalid data types', async () => {
        const invalidUpdate = {
            product_name: "Invalid product",
            product_unit_price: "Fake number",
            product_quantity: "Fake number",
            is_still_offered: "Not a boolean"
        }
        const res = await request(app).patch('/products/1').send(invalidUpdate);
        expect(res.statusCode).toEqual(400);
        // expect(res.body.message).toEqual("Invalid data types provided.");
    })

    it('should return an error when updating a product with empty request', async () => {
        const emptyUpdate = {}
        const res = await request(app).patch('/products/1').send(emptyUpdate);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when updating a product with non-existent fields', async () => {
        const fakeProduct = {
            pangalan: "Fake product",
            presyo: 1000,
            kantidad: 100,
            ginabaligya_pa: false
        }
        const res = await request(app).patch('/products/1').send(fakeProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when updating a non-existent product', async () => {
        const realProduct = {
            product_name: "Tarpaulin 9 x 9"
        }
        const res = await request(app).patch('/products/999').send(realProduct);
        expect(res.statusCode).toEqual(404);
    })

    it('should return an error when updating a product with produt name more than 255 characters', async () => {
        const abnormalProduct = {
            product_name: "a".repeat(300)
        }
        const res = await request(app).patch('/products/1').send(abnormalProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when updating a product with numeric values more than INT limit', async () => {
        const fakeProduct = {
            product_unit_price: 3000000000,
            product_quantity: 3000000000,
        }
        const res = await request(app).patch('/products/1').send(fakeProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when updating product price with numeric value of 0', async () => {
        const fakeProduct = {
            product_unit_price: 0
        }
        const res = await request(app).patch('/products/1').send(fakeProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return an error when updating a product with negative numeric values', async () => {
        const fakeProduct = {
            product_unit_price: -100,
            product_quantity: -100
        }
        const res = await request(app).patch('/products/1').send(fakeProduct);
        expect(res.statusCode).toEqual(400);
    })

    it('should return a product via the search route', async () => {
        const res = await request(app).get('/products/search?name=Mouse');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    })

    it('should return an empty array when searching for a non-existent product', async () => {
        const res = await request(app).get('/products/search?name=NonExistentProduct');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toEqual(0);
    });

    it('should return an error when searching for a product with an empty name query', async () => {
        const res = await request(app).get('/products/search?name=');
        expect(res.statusCode).toEqual(400);
    });

    it('should reject whitespace queries', async () => {
        const res = await request(app).get('/products/search?name=   ');
        expect(res.statusCode).toEqual(400);

        const res2 = await request(app).get('/products/search?name=+++');
        expect(res2.statusCode).toEqual(400);

        const res3 = await request(app).get('/products/search/?name=%20%20%20');
        expect(res3.statusCode).toEqual(400);
    })

    it('should reject queries that are more than 255 characters long', async () => {
        const res = await request(app).get(`/products/search?name=${'a'.repeat(300)}`);
        expect(res.statusCode).toEqual(400);
    })

    it('should reject queries that are less than 2 characters long', async () => {
        const res = await request(app).get('/products/search?name=A');
        expect(res.statusCode).toEqual(400);
    })
});