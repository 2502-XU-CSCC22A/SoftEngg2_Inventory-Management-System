import express from "express";
import { upload } from "../config/multer.js"
export const productsRouter = express.Router();
import models from "../config/db.js";
import { Op } from "sequelize";
import { validate, checkValidQuery } from "../middleware/productsMiddleware.js";
import { insertNewProduct, updateExistingProduct, updateProductImage } from "../controllers/productsController.js";
import { insertProductSchema, updateProductSchema } from "../schemas/schemas.js";

// -> get all offered products
productsRouter.get('/', async (req, res) => {
  const products = await models.products.findAll({
    where: {
      is_still_offered: true,
    }
  });
  return res.status(200).json({ message: "Products fetched successfully.", data: products});
})

productsRouter.get('/show-hidden', async (req, res) => {
  const products = await models.products.findAll({})
  return res.status(200).json({ message: "Products fetched successfully.", data: products });
})

productsRouter.get('/search', checkValidQuery(), async (req, res) => {
  try {
    const { name } = req.query;
    const products = await models.products.findAll({
      where: {
        product_name: {
          [Op.iLike]: `%${name}%`
        },
        is_still_offered: true,
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
productsRouter.post('/', upload.single('image'), validate(insertProductSchema), insertNewProduct)

// update any of the product details (except for product_id)
productsRouter.patch('/:productId', validate(updateProductSchema), updateExistingProduct);

productsRouter.patch('/:productId/image', upload.single('image'), updateProductImage); 