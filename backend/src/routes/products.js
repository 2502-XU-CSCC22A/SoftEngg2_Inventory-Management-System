import express from "express";
export const productsRouter = express.Router();
import models from "../config/db.js";
import { Op } from "sequelize";
import { validateInsertPayload } from "../middleware/productsMiddleware.js";
import { validatePatchPayload, checkValidQuery } from "../middleware/productsMiddleware.js";
import { insertNewProduct, updateExistingProduct } from "../controllers/productsController.js";

const productsSchema = {
  product_name: "string",
  product_unit_price: "number",
  product_quantity: "number",
  is_still_offered: "boolean"
}

// -> get all products
productsRouter.get('/', async (req, res) => {
  const products = await models.products.findAll();
  return res.status(200).json({ message: "Products fetched successfully.", data: products});
})

productsRouter.get('/search', checkValidQuery(), async (req, res) => {
  try {
    const { name } = req.query;
    const products = await models.products.findAll({
      where: {
        product_name: {
          [Op.iLike]: `%${name}%`
        }
      }
    });
    return res.status(200).json({ message: "Product fetched successfully", data: products });
  }
  catch (error) {
    console.error("Error fetching products by name:", error);
    return res.status(error.status || 500).json({ message: "An error occurred while fetching products." });
  }
})

// -> add new product
productsRouter.post('/', validateInsertPayload(productsSchema), insertNewProduct)

// update any of the product details (except for product_id)
productsRouter.patch('/:productId', validatePatchPayload(productsSchema), updateExistingProduct);
