import models from "../config/db.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const insertNewProduct = async (req, res) => {
    try {
        const { product_name, product_unit_price, product_quantity } = req.body;

        const origPath = req.file.path;
        const modFileName = `sqr_${req.file.filename}`;
        const newPath = path.join(req.file.destination, modFileName);

        const buf = fs.readFileSync(origPath);

        const photoHash = crypto.createHash('md5').update(buf).digest('hex');

        const hashMatch = await models.products.findOne({
            where: {
                product_img_hash: photoHash,
            }
        })

        if (hashMatch) {
            return res.status(409).json({ message: "Photo already exists in another product. Please use another photo."});
        }

        await sharp(origPath).resize(300, 300, {
            fit: "cover",
            position: sharp.strategy.entropy,
        }).toFormat('webp').toFile(newPath);

        fs.unlinkSync(origPath);

        const product = await models.products.create({
            product_name,
            product_unit_price,
            product_quantity,
            product_img_url: modFileName,
            product_img_hash: photoHash,
            is_still_offered: true,
        });

        return res.status(201).json({
            message: "Product added successfully.",
            data: product,
        })
    }
    catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
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

export const updateProductImage = async (req, res) => {
    try {
        const updatedProduct = await models.products.findByPk(req.params.productId);
        const origPath = req.file.path;

        const modFileName = `sqr_${req.file.filename}`;
        const newPath = path.join(req.file.destination, modFileName);

        const buf = fs.readFileSync(origPath);

        const photoHash = crypto.createHash('md5').update(buf).digest('hex');

        const hashMatch = await models.products.findOne({
            where: {
                product_img_hash: photoHash,
            }
        })

        if (hashMatch) {
            return res.status(409).json({ message: "Photo already exists in another product. Please use another photo." });
        }

        await sharp(origPath).resize(300, 300, {
            fit: "cover",
            position: sharp.strategy.entropy,
        }).toFormat('webp').toFile(newPath);

        fs.unlinkSync(origPath);

        await models.products.update({
            product_img_url: modFileName,
            product_img_hash: photoHash,
        }, {
            where: {
                product_id: req.params.productId,
            }
        })

        return res.status(200).json({ message: "Product image updated successfully." });
    }
    catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ message: "Error updating product image" });
    }
}