import models from "../config/db.js";

export const insertNewProduct = async (req, res) => {
    try {
        await models.products.create(req.body);
        return res.json({
            message: "Product added successfully.",
            data: req.body,
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