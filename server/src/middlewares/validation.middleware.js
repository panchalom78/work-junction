import { body, validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return errorResponse(res, 400, "Validation failed", formattedErrors);
    }

    next();
};

/**
 * Register validation rules
 */
const registerValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters long"),

    body("phone")
        .matches(/^[0-9]{10}$/)
        .withMessage("Please enter a valid 10-digit phone number"),

    body("role")
        .isIn(["CUSTOMER", "WORKER", "SERVICE_AGENT", "ADMIN"])
        .withMessage("Invalid role"),

    handleValidationErrors,
];

/**
 * Login validation rules
 */
const loginValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("password").notEmpty().withMessage("Password is required"),

    handleValidationErrors,
];

/**
 * Update profile validation rules
 */
const updateProfileValidation = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters long"),

    body("phone")
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage("Please enter a valid 10-digit phone number"),

    handleValidationErrors,
];

/**
 * Change password validation rules
 */
const changePasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("New password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("New password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("New password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage(
            "New password must contain at least one special character"
        ),

    handleValidationErrors,
];

export {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    changePasswordValidation,
    handleValidationErrors,
};
