import express from "express";
import { loginUser, logoutUser } from "../controllers/authController";
import { validateLoginPayload } from "../middleware/authMiddleware";

export const authRouter = express.Router();

const loginSchema = {
  username: "string",
  password: "string",
}

// -> login user
authRouter.post("/login", validateLoginPayload(loginSchema), loginUser);

// -> logout user
authRouter.delete("/logout", logoutUser);