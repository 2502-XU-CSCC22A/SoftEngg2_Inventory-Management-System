import express from "express";
import { getTotalRevenue, getMonthlyRevenue, getTopProduct, getDailyRevenue } from "../controllers/reportController.js";
import models from "../config/db.js";

export const reportsRouter = express.Router();

reportsRouter.get("/total-revenue", getTotalRevenue);
reportsRouter.get("/monthly-revenue", getMonthlyRevenue);
reportsRouter.get("/top-product", getTopProduct);
reportsRouter.get("/daily-revenue", getDailyRevenue);

// Activity log endpoint
reportsRouter.get("/activity-log", async (req, res) => {
  try {
    const salesLog = await models.transaction_items.findAll({
      include: [{
        model: models.transactions,
        as: 'transaction',
        where: { voided_at: null },
        attributes: ['transaction_timestamp']
      }],
      attributes: ['product_name', 'quantity_bought']
    });
    const activities = salesLog.map(item => ({
      name: item.product_name,
      datetime: item.transaction.transaction_timestamp,
      qty: item.quantity_bought,
      type: 'remove'
    }));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});