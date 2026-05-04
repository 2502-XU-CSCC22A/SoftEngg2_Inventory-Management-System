import express from "express";
import models from "../config/db.js";

export const activityLogsRouter = express.Router();

// -> get paginated activity logs
activityLogsRouter.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await models.activity_logs.findAndCountAll({
      include: {
        model: models.users,
        as: "performed_by_user",
        attributes: ['user_id', 'username'],
        required: false, // LEFT JOIN — logs still show even if user was deleted
      },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs: count,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return res.status(500).json({ message: "Error fetching activity logs." });
  }
});
