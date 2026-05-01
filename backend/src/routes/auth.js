import express from "express";
import { loginUser, refreshToken, logoutUser } from "../controllers/authController";

export const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.delete("/logout", logoutUser);