import express from "express";
import { upload } from "../config/multer.js"
export const productsRouter = express.Router();
import models from "../config/db.js";
import { Op } from "sequelize";
import { validate, checkValidQuery } from "../middleware/productsMiddleware.js";
import { insertNewProduct, updateExistingProduct, updateProductImage } from "../controllers/productsController.js";
import { insertProductSchema, updateProductSchema } from "../schemas/schemas.js";

// unified get products route 
productsRouter.get('/', async (req, res) => {
  const { is_still_offered } = req.query;

  let products = null;

  if (is_still_offered !== undefined) {
    products = await models.products.findAll({
      where: {
        is_still_offered: is_still_offered === "true",
      }
    })
  }
  else {
    products = await models.products.findAll({})
  }

  return res.status(200).json({ message: "Products fetched successfully.", data: products })
})

// -> add new product
productsRouter.post('/', upload.single('image'), validate(insertProductSchema), insertNewProduct)

// update any of the product details (except for product_id)
productsRouter.patch('/:productId', validate(updateProductSchema), updateExistingProduct);

productsRouter.patch('/:productId/image', upload.single('image'), updateProductImage); 