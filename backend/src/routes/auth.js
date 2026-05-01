import express from "express";
import { loginUser, getCurrent, logoutUser } from "../controllers/authController.js";
import { validateLoginPayload } from "../middleware/authMiddleware.js";

export const authRouter = express.Router();

const loginSchema = {
  username: "string",
  password: "string",
}

// -> login user
authRouter.post("/login", validateLoginPayload(loginSchema), loginUser);

// -> gets current user
authRouter.get("/me", getCurrent);

// -> logout user
authRouter.delete("/logout", logoutUser);