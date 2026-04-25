import express from "express";

export const transactionsRouter = express.Router();

import models, { sequelize } from "../config/db.js";
import { validateTransaction } from "../middleware/transactionsMiddleware.js";
import { insertTransaction } from "../controllers/transactionsController.js";

/*
expected payload: 
{
  transaction: {...},
  items: {...},
}
*/
const transactionsSchema = {
  operation: "string",
  prev_txn_id: "number",
  transaction_timestamp: "number",
  payment_type: "string",
  payment_refstr: "string",
  created_by: "number",
  voided_at: "number",
  items: "object",
}

//add error handling
// -> get all transactions
transactionsRouter.get('/', async (req, res) => {
  const transactions = await models.transactions.findAll({
    include: {
      model: models.transaction_items,
      as: "transaction_items",
    }
  });
  res.json(transactions);
})

// -> record transaction
transactionsRouter.post('/', validateTransaction(transactionsSchema), insertTransaction);