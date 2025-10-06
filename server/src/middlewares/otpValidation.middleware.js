import { body, query, param, validationResult } from "express-validator";
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
 * Send OTP validation
 */
const sendOTPValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("purpose")
        .optional()
        .isIn(["REGISTRATION", "PASSWORD_RESET", "EMAIL_CHANGE"])
        .withMessage("Invalid purpose"),

    handleValidationErrors,
];

/**
 * Verify OTP validation
 */
const verifyOTPValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("otp")
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isNumeric()
        .withMessage("OTP must contain only numbers"),

    body("purpose")
        .optional()
        .isIn(["REGISTRATION", "PASSWORD_RESET", "EMAIL_CHANGE"])
        .withMessage("Invalid purpose"),

    handleValidationErrors,
];

/**
 * Resend OTP validation
 */
const resendOTPValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("purpose")
        .optional()
        .isIn(["REGISTRATION", "PASSWORD_RESET", "EMAIL_CHANGE"])
        .withMessage("Invalid purpose"),

    handleValidationErrors,
];

/**
 * Get OTP status validation
 */
const getOTPStatusValidation = [
    param("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    query("purpose")
        .optional()
        .isIn(["REGISTRATION", "PASSWORD_RESET", "EMAIL_CHANGE"])
        .withMessage("Invalid purpose"),

    handleValidationErrors,
];

export {
    sendOTPValidation,
    verifyOTPValidation,
    resendOTPValidation,
    getOTPStatusValidation,
};
