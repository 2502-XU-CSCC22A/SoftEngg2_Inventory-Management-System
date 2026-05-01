import express from "express";
import models from "../config/db.js";
import { validateAddPayload } from "../middleware/usersMiddleware.js";
import { addUser, archiveUser } from "../controllers/usersController.js";
import { authenticateUser, requreAdmin } from "../middleware/authMiddleware.js";

export const usersRouter = express.Router();

const usersSchema = {
  username: "string",
  password: "string",
  confirmPassword: "string",
  role: "string"
}

// -> add user
usersRouter.post('/', validateAddPayload(usersSchema), authenticateUser, requreAdmin, addUser);

// -> remove(archive) user
usersRouter.delete('/:user_id', authenticateUser, requreAdmin, archiveUser);