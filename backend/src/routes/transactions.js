import express from "express";

export const transactionsRouter = express.Router();

import models, { sequelize } from "../config/db.js";
import { carvePayload, validate, validateMonthAndYear } from "../middleware/transactionsMiddleware.js";
import { getTransactionByMonthAndYear, insertTransaction, updateTransaction, getAllTransactionsByMonthAndYear, updateTransactionStatus } from '../controllers/transactionsController.js';
import { insertTransactionSchema, updateTransactionSchema } from "../schemas/schemas.js";
import { fetchUpdateableTransaction } from "../middleware/transactionsMiddleware.js";

transactionsRouter.get('/', async (req, res) => {
  const transactions = await models.transactions.findAll({
    include: {
      model: models.transaction_items,
      as: "transaction_items",
    },
    where: {
      voided_at: null,
    }
  });
  res.json(transactions);
})

transactionsRouter.get('/show-all', async (req, res) => {
  const transactions = await models.transactions.findAll({
    include: {
      model: models.transaction_items,
      as: "transaction_items",
    },
  });
  res.json(transactions);
});


// -> get transactions by month and year (with optional status filter)
transactionsRouter.get('/filter', validateMonthAndYear, async (req, res) => {
  // month = 1-based index, so we need to subtract 1 from the month value;
  // year = 4-digit year
  // status = 'pending' | 'completed' | 'cancelled' | 'all' (optional, defaults to all)
  const { month, year, status } = req.query;

  const allowedStatuses = ['pending', 'completed', 'cancelled', 'all'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status filter.' });
  }

  try {
    const transactions = await getTransactionByMonthAndYear(month, year, status || null);
    if (transactions) {
      return res.status(200).json({ message: "Data fetched successfully.", data: transactions })
    }
  }
  catch (error) {
    console.error(`Error in fetch txn by date: ${error}`);
    return res.status(error.status || 500).json({ message: error.message });
  }
})

// -> record transaction
transactionsRouter.post('/', validate(insertTransactionSchema), async (req, res, next) => {
  try {
    let result;
    await sequelize.transaction(async t => {
      result = await insertTransaction(req.body, t, req.session.user.user_id);
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

// get ALL transactions by month and year (for logs)
transactionsRouter.get('/show-all/filter', validateMonthAndYear, async (req, res) => {
  const { month, year } = req.query;
  try {
    const transactions = await getAllTransactionsByMonthAndYear(month, year);
    if (transactions) {
      return res.status(200).json({ message: "Data fetched successfully.", data: transactions })
    }
  }
  catch (error) {
    console.error(`Error in fetch txn by date: ${error}`);
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
        result = await updateTransaction(req.oldTxn, req.updatedPayload, req.session.user.user_id, t);
      })

      if (result) {
        return res.status(200).json({ message: "Transaction updated successfully.", data: result });
      }
    }
    catch (error) {
      console.error("Error in patch: ", error.message);
      return res.status(error.status || 500).json({ message: error.message });
    }
})

// Enhancement: update a transaction's status only (lifecycle transition)
// Allowed: pending -> completed, pending -> cancelled
// Blocks: completed -> *, cancelled -> *
transactionsRouter.patch('/:transactionId/status', async (req, res) => {
  const { transactionId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    let result;
    await sequelize.transaction(async t => {
      result = await updateTransactionStatus(Number(transactionId), status, t);
    });

    return res.status(200).json({ message: 'Transaction status updated successfully.', data: result });
  }
  catch (error) {
    console.error('Error updating transaction status:', error.message);
    return res.status(error.status || 500).json({ message: error.message });
  }
})