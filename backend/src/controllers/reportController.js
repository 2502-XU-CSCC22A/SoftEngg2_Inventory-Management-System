import models, { sequelize } from "../config/db.js";
import { Op } from "sequelize";

export const getTotalRevenue = async (req, res) => {
  try {
   
    const [result] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(ti.quantity_bought * ti.product_unit_price), 0) AS totalRevenue,
        COALESCE(SUM(ti.quantity_bought), 0) AS totalQuantitySold
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.transaction_id
      WHERE t.voided_at IS NULL
    `);
    res.json({
      totalRevenue: parseFloat(result[0]?.totalRevenue || 0),
      totalQuantitySold: parseInt(result[0]?.totalQuantitySold || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const getMonthlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const monthlyData = await models.transactions.findAll({
      attributes: [
        [sequelize.fn('DATE_PART', 'month', sequelize.col('transaction_timestamp')), 'month'],
        [sequelize.fn('SUM', sequelize.literal('"transaction_items"."quantity_bought" * "transaction_items"."product_unit_price"')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('transaction_items.quantity_bought')), 'quantity']
      ],
      where: {
        voided_at: null,
        transaction_timestamp: {
          [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31, 23, 59, 59)]
        }
      },
      include: [{
        model: models.transaction_items,
        as: 'transaction_items',
        attributes: []
      }],
      group: [sequelize.fn('DATE_PART', 'month', sequelize.col('transaction_timestamp'))],
      order: [[sequelize.fn('DATE_PART', 'month', sequelize.col('transaction_timestamp')), 'ASC']],
      raw: true
    });
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const found = monthlyData.find(item => parseInt(item.month) === m);
      result.push({
        month: m,
        revenue: found ? parseFloat(found.revenue) : 0,
        quantity: found ? parseInt(found.quantity) : 0
      });
    }
    res.json({ year, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getTopProduct = async (req, res) => {
  try {
    const top = await models.transaction_items.findAll({
      attributes: [
        'product_id',
        'product_name',
        [sequelize.fn('SUM', sequelize.col('quantity_bought')), 'total_quantity']
      ],
      include: [{
        model: models.transactions,
        as: 'transaction',
        where: { voided_at: null },
        attributes: []
      }],
      group: ['product_id', 'product_name'],
      order: [[sequelize.literal('total_quantity'), 'DESC']],
      limit: 1,
      raw: true
    });
    res.json(top[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Valid year and month required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await models.transactions.findAll({
      where: {
        voided_at: null,
        transaction_timestamp: { [Op.gte]: startDate, [Op.lt]: endDate }
      },
      include: [{ model: models.transaction_items, as: 'transaction_items', required: true }]
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyRevenue = Array(daysInMonth).fill(0);

    transactions.forEach(transaction => {
      const day = new Date(transaction.transaction_timestamp).getDate();
      const revenue = transaction.transaction_items.reduce(
        (sum, item) => sum + (item.quantity_bought * item.product_unit_price), 0
      );
      dailyRevenue[day - 1] += revenue;
    });

    const data = dailyRevenue.map((revenue, i) => ({ day: i + 1, revenue }));
    res.json({ year, month, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};