import { registerConsoleShortcuts } from "vitest/node";
import models, { sequelize } from "../config/db.js";
import { where } from "sequelize";
import { getValidProduct, getValidUser, insertTransactionItem, updateProductQuantity, validatePurchasedAmount } from "../services/transactionService.js";

export const insertTransaction = async (req, res, next) => {
    try {
        await sequelize.transaction(async t => {
            const user = await getValidUser(req.body.created_by, t);

            const { items, ...transactionData } = req.body;

            const txn = await models.transactions.create(transactionData, { transaction: t })
            const txnJSON = txn.toJSON();

            for (const item of items) {
                const product = await getValidProduct(item.product_id, t);
                const productJSON = product.toJSON();
                await validatePurchasedAmount(item.quantity_bought, product.product_quantity);

                const txnItem = await insertTransactionItem(productJSON, txnJSON, item, t);

                console.log(txnItem);
                await updateProductQuantity(productJSON, item, t); 
            }
        })
        
        return res.status(200).json({ 
            message: "Transaction inserted successfully.",
        });
    }
    catch (error) {
        return res.status(error.status || 500).json({ message: error.message })
    }
}