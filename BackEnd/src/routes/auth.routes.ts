import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
export const authRoutes = Router();
authRoutes.post("/registro", register);
authRoutes.post("/login", login);
