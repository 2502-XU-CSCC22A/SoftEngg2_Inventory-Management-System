import models from "../config/db.js";
import { createActivityLog } from "../services/activityLogService.js";

export const insertNewProduct = async (req, res) => {
    try {
        const product = await models.products.create(req.body);

        await createActivityLog({
            action: "PRODUCT_ADDED",
            module: "products",
            description: `Product "${req.body.product_name}" added (qty: ${req.body.product_quantity}, price: ${req.body.product_unit_price})`,
            reference_id: product.product_id,
            new_value: product.toJSON(),
            performed_by: req.session?.user?.user_id || null,
        });

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

        const previousValue = product.toJSON();
        
        await models.products.update(req.body, {
            where: {
                product_id: productId,
            }
        })

        await createActivityLog({
            action: "PRODUCT_UPDATED",
            module: "products",
            description: `Product "${previousValue.product_name}" (ID: ${productId}) updated`,
            reference_id: parseInt(productId),
            previous_value: previousValue,
            new_value: { ...previousValue, ...req.body },
            performed_by: req.session?.user?.user_id || null,
        });
        
        return res.json({
            message: "Product updated successfully.",
            data: req.body,  
        })
        
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating product."});
    }
}