import express from "express";
import models from "../config/db.js";
import { validateAddPayload } from "../middleware/usersMiddleware.js";
import { getUsers, addUser, archiveUser } from "../controllers/usersController.js";
import { authenticateUser, requireAdmin } from "../middleware/authMiddleware.js";
import { editUser } from "../controllers/usersController.js";

export const usersRouter = express.Router();

const usersSchema = {
  username: "string",
  role: "string",
  password: "string",
  confirmPassword: "string"
}

// -> get users
usersRouter.get('/', authenticateUser, requireAdmin, getUsers);

// -> add user
usersRouter.post('/', validateAddPayload(usersSchema), authenticateUser, requireAdmin, addUser);

// -> remove(archive) user
usersRouter.delete('/:user_id', authenticateUser, requireAdmin, archiveUser);

// -> edit user
usersRouter.put('/:user_id', authenticateUser, requireAdmin, editUser);