import User from "../models/user.model.js";
import { generateOTP, isValidOTPFormat } from "../utils/otp.js";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/email.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * @desc    Send OTP to email for verification
 * @route   POST /api/otp/send
 * @access  Public
 */
const sendOTP = async (req, res) => {
    try {
        const { email, purpose = "REGISTRATION" } = req.body;

        if (!email) {
            return errorResponse(res, 400, "Email is required");
        }

        // Check if user exists
        const user = await User.findOne({ email });

        if (purpose === "REGISTRATION") {
            if (!user) {
                return errorResponse(
                    res,
                    404,
                    "User not found. Please register first."
                );
            }

            if (user.isVerified) {
                return errorResponse(res, 400, "Email is already verified");
            }
        } else if (purpose === "PASSWORD_RESET") {
            if (!user) {
                return errorResponse(
                    res,
                    404,
                    "No account found with this email"
                );
            }
        }

        // Check for recent OTP (rate limiting) - check if OTP was created in last 1 minute
        if (user.otp && user.otp.createdAt) {
            const timeSinceLastOTP = Date.now() - user.otp.createdAt.getTime();
            if (timeSinceLastOTP < 60 * 1000) {
                // 1 minute
                const waitTime = Math.ceil(
                    (60 * 1000 - timeSinceLastOTP) / 1000
                );
                return errorResponse(
                    res,
                    429,
                    `Please wait ${waitTime} seconds before requesting a new OTP.`
                );
            }
        }

        // Generate new OTP
        const otp = generateOTP(6);

        // Set OTP using model method
        await user.setOTP(otp, purpose, 10);

        // Send OTP email
        await sendOTPEmail(email, otp, user.name, purpose);

        return successResponse(
            res,
            200,
            "OTP sent successfully to your email",
            {
                email,
                expiresIn: "10 minutes",
            }
        );
    } catch (error) {
        console.error("Send OTP error:", error);
        return errorResponse(res, 500, "Failed to send OTP. Please try again.");
    }
};

/**
 * @desc    Verify OTP and mark user as verified
 * @route   POST /api/otp/verify
 * @access  Public
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp, purpose = "REGISTRATION" } = req.body;

        // Validation
        if (!email || !otp) {
            return errorResponse(res, 400, "Email and OTP are required");
        }

        if (!isValidOTPFormat(otp)) {
            return errorResponse(res, 400, "Invalid OTP format");
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        // Check if OTP exists
        if (!user.otp || !user.otp.code) {
            return errorResponse(
                res,
                404,
                "No OTP found. Please request a new one."
            );
        }

        // Check if OTP purpose matches
        if (user.otp.purpose !== purpose) {
            return errorResponse(res, 400, "Invalid OTP purpose");
        }

        // Check if OTP is expired
        if (user.isOTPExpired()) {
            await user.clearOTP();
            return errorResponse(
                res,
                400,
                "OTP has expired. Please request a new one."
            );
        }

        // Check max attempts
        if (user.otp.attempts >= 5) {
            await user.clearOTP();
            return errorResponse(
                res,
                429,
                "Maximum verification attempts exceeded. Please request a new OTP."
            );
        }

        // Verify OTP
        if (user.otp.code !== otp) {
            await user.incrementOTPAttempts();
            const remainingAttempts = 5 - user.otp.attempts;

            return errorResponse(
                res,
                400,
                `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
            );
        }

        // OTP is correct
        if (purpose === "REGISTRATION") {
            // Update user verification status
            user.isVerified = true;
            await user.clearOTP();
            await user.save();

            // Send welcome email
            await sendWelcomeEmail(email, user.name);

            return successResponse(
                res,
                200,
                "Email verified successfully! Your account is now active.",
                {
                    isVerified: true,
                    email: user.email,
                }
            );
        } else if (purpose === "PASSWORD_RESET") {
            // For password reset, mark OTP as verified but don't clear it yet
            return successResponse(
                res,
                200,
                "OTP verified successfully. You can now reset your password.",
                {
                    verified: true,
                    email: user.email,
                }
            );
        }
    } catch (error) {
        console.error("Verify OTP error:", error);
        return errorResponse(
            res,
            500,
            "Failed to verify OTP. Please try again."
        );
    }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/otp/resend
 * @access  Public
 */
const resendOTP = async (req, res) => {
    try {
        const { email, purpose = "REGISTRATION" } = req.body;

        if (!email) {
            return errorResponse(res, 400, "Email is required");
        }

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        if (purpose === "REGISTRATION" && user.isVerified) {
            return errorResponse(res, 400, "Email is already verified");
        }

        // Check for rate limiting - allow resend after 1 minute
        if (user.otp && user.otp.createdAt) {
            const timeSinceLastOTP = Date.now() - user.otp.createdAt.getTime();
            if (timeSinceLastOTP < 60 * 1000) {
                const waitTime = Math.ceil(
                    (60 * 1000 - timeSinceLastOTP) / 1000
                );
                return errorResponse(
                    res,
                    429,
                    `Please wait ${waitTime} seconds before requesting a new OTP.`
                );
            }
        }

        // Generate and send new OTP
        const otp = generateOTP(6);
        await user.setOTP(otp, purpose, 10);

        await sendOTPEmail(email, otp, user.name, purpose);

        return successResponse(
            res,
            200,
            "New OTP sent successfully to your email",
            {
                email,
                expiresIn: "10 minutes",
            }
        );
    } catch (error) {
        console.error("Resend OTP error:", error);
        return errorResponse(
            res,
            500,
            "Failed to resend OTP. Please try again."
        );
    }
};

/**
 * @desc    Check OTP status
 * @route   GET /api/otp/status/:email
 * @access  Public
 */
const getOTPStatus = async (req, res) => {
    try {
        const { email } = req.params;
        const { purpose = "REGISTRATION" } = req.query;

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        // Check if user has OTP
        if (!user.otp || !user.otp.code) {
            return successResponse(res, 200, "No pending OTP", {
                hasPendingOTP: false,
                isVerified: user.isVerified,
            });
        }

        // Check if OTP purpose matches
        if (user.otp.purpose !== purpose) {
            return successResponse(
                res,
                200,
                "No pending OTP for this purpose",
                {
                    hasPendingOTP: false,
                    isVerified: user.isVerified,
                }
            );
        }

        const isExpired = user.isOTPExpired();
        const timeRemaining = isExpired
            ? 0
            : Math.floor((user.otp.expiresAt - Date.now()) / 1000);

        return successResponse(res, 200, "OTP status retrieved", {
            hasPendingOTP: !isExpired,
            isExpired,
            timeRemaining,
            attemptsRemaining: 5 - user.otp.attempts,
            isVerified: user.isVerified,
        });
    } catch (error) {
        console.error("Get OTP status error:", error);
        return errorResponse(res, 500, "Failed to get OTP status");
    }
};

export { sendOTP, verifyOTP, resendOTP, getOTPStatus };
