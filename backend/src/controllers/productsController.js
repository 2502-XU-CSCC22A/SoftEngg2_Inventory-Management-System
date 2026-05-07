import models from "../config/db.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const insertNewProduct = async (req, res) => {
    try {
        const { product_name, product_unit_price, product_quantity } = req.body;

        const origPath = req.file.path;
        const modFileName = `sqr_${req.file.filename}`;
        const newPath = path.join(req.file.destination, modFileName);

        await sharp(origPath).resize(300, 300, {
            fit: "cover",
            position: sharp.strategy.entropy,
        }).toFormat('webp').toFile(newPath);

        fs.unlinkSync(origPath);

        const product = await models.products.create({
            product_name,
            product_unit_price,
            product_quantity,
            product_img_url: modFileName ? modFileName : 'lebron.png',
            is_still_offered: true,
        });
        return res.status(201).json({
            message: "Product added successfully.",
            data: product,
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error adding product.",
            error: err.message,
        })
    }
}

export const updateExistingProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await models.products.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: `Product ${productId} not found.` })
        }
        
        await models.products.update(req.body, {
            where: {
                product_id: productId,
            }
        })
        
        return res.json({
            message: "Product updated successfully.",
            data: req.body,  
        })
        
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating product."});
    }
}