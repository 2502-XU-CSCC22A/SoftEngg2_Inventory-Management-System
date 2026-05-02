import express from "express";

export const transactionsRouter = express.Router();

import models, { sequelize } from "../config/db.js";
import { carvePayload, validate } from "../middleware/transactionsMiddleware.js";
import { insertTransaction, updateTransaction } from "../controllers/transactionsController.js";
import { insertTransactionSchema, updateTransactionSchema } from "../schemas/schemas.js";
import { fetchUpdateableTransaction } from "../middleware/transactionsMiddleware.js";

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
transactionsRouter.post('/', validate(insertTransactionSchema), async (req, res, next) => {
  try {
    let result;
    await sequelize.transaction(async t => {
      result = await insertTransaction(req.body, t);
    })

    if (result) {
      return res.status(201).json({ message: "Transaction inserted successfully.", data: result });
    }
  }
  catch (error) {
    console.error("Error in insert: ", error);
    return res.status(error.status || 500).json({ message: error.message });
  }
})

// -> update transaction 
transactionsRouter.patch('/:transactionId', 
  fetchUpdateableTransaction, 
  validate(updateTransactionSchema), 
  carvePayload,
  async (req, res, next) => {
    try {
      let result;
      await sequelize.transaction(async t => {
        result = await updateTransaction(req.oldTxn, req.updatedPayload, t);
      })

      if (result) {
        return res.status(200).json({ message: "Transaction updated successfully.", data: result });
      }
    }
    catch (error) {
      console.error("Error in patch: ", error);
      return res.status(error.status || 500).json({ message: error.message });
    }
})