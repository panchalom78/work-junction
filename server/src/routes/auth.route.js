import { Router } from "express";
const router = Router();

import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    getProfile,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    changePasswordValidation,
} from "../middlewares/validation.middleware.js";

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put(
    "/change-password",
    protect,
    changePasswordValidation,
    changePassword
);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
