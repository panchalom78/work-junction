import User from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateTokenAndSetCookie, clearAuthCookie } from "../utils/jwt.js";
import {
    successResponse,
    errorResponse,
    formatUserResponse,
} from "../utils/response.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/email.js";
import mongoose from "mongoose";

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { email, password, name, phone, role, address } = req.body;

        // Validate required environment variables
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set in environment variables");
            console.error("Please create a .env file in the server directory with JWT_SECRET");
            return errorResponse(
                res,
                500,
                "Server configuration error: JWT_SECRET is missing. Please create a .env file in the server directory with JWT_SECRET variable."
            );
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return errorResponse(res, 400, "Email already registered");
            }
            return errorResponse(res, 400, "Phone number already registered");
        }

        // Hash password
        let hashedPassword;
        try {
            hashedPassword = await hashPassword(password);
        } catch (hashError) {
            console.error("Password hashing error:", hashError);
            return errorResponse(res, 500, "Error processing password. Please try again.");
        }

        // Create user
        let user;
        try {
            user = await User.create({
                email,
                password: hashedPassword,
                name,
                phone,
                role,
                address: address || {},
                isVerified: false,
            });
        } catch (createError) {
            // Handle duplicate key error during creation
            if (createError.code === 11000) {
                const field = Object.keys(createError.keyPattern)[0];
                return errorResponse(
                    res,
                    409,
                    `${field.charAt(0).toUpperCase() + field.slice(1)} already registered`
                );
            }
            throw createError;
        }

        // Generate OTP for email verification
        const otp = generateOTP(6);

        // Set OTP using the model method
        try {
            await user.setOTP(otp, "REGISTRATION", 10);
        } catch (otpError) {
            console.error("Error setting OTP:", otpError);
            // Continue registration even if OTP setting fails
        }

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name, "REGISTRATION");
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Continue registration even if email fails
        }

        // Generate token and set cookie
        try {
            generateTokenAndSetCookie(res, user);
        } catch (tokenError) {
            console.error("Token generation error:", tokenError);
            // User is created, but token generation failed
            // Still return success but log the error
            console.warn("User created but token generation failed. User ID:", user._id);
        }

        return successResponse(
            res,
            201,
            "User registered successfully. Please check your email for OTP verification.",
            {
                user: formatUserResponse(user),
                message:
                    "OTP sent to your email. Please verify within 10 minutes.",
            }
        );
    } catch (error) {
        console.error("Register error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return errorResponse(res, 400, "Validation error", errors);
        }

        // Handle duplicate key error (email or phone already exists)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return errorResponse(
                res,
                409,
                `${field.charAt(0).toUpperCase() + field.slice(1)} already registered`
            );
        }

        // Handle mongoose errors
        if (error.name === "MongoServerError") {
            return errorResponse(
                res,
                400,
                "Database error. Please check your input and try again."
            );
        }

        // Provide detailed error in development, generic in production
        const errorMessage = process.env.NODE_ENV === "development"
            ? error.message || "Server error during registration"
            : "Server error during registration. Please try again later.";

        return errorResponse(res, 500, errorMessage);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 401, "Invalid credentials");
        }

        const isPasswordValid = await verifyPassword(user.password, password);

        if (!isPasswordValid) {
            return errorResponse(res, 401, "Invalid credentials");
        }

        generateTokenAndSetCookie(res, user);

        return successResponse(
            res,
            200,
            "Login successful",
            formatUserResponse(user)
        );
    } catch (error) {
        console.error("Login error:", error);
        return errorResponse(res, 500, "Server error during login");
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
    try {
        clearAuthCookie(res);
        return successResponse(res, 200, "Logout successful");
    } catch (error) {
        console.error("Logout error:", error);
        return errorResponse(res, 500, "Server error during logout");
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        return successResponse(
            res,
            200,
            "User profile retrieved successfully",
            formatUserResponse(req.user)
        );
    } catch (error) {
        console.error("GetMe error:", error);
        return errorResponse(res, 500, "Server error");
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        const isPasswordValid = await verifyPassword(
            user.password,
            currentPassword
        );

        if (!isPasswordValid) {
            return errorResponse(res, 401, "Current password is incorrect");
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        clearAuthCookie(res);

        return successResponse(
            res,
            200,
            "Password changed successfully. Please login again."
        );
    } catch (error) {
        console.error("Change password error:", error);
        return errorResponse(res, 500, "Server error during password change");
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const userId = req.user._id;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Build update object with only provided fields
        const updateFields = {};

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be a non-empty string",
                });
            }
            updateFields.name = name.trim();
        }

        if (phone !== undefined) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit phone number",
                });
            }
            updateFields.phone = phone;
        }

        if (address !== undefined) {
            if (typeof address !== "object" || address === null) {
                return res.status(400).json({
                    success: false,
                    message: "Address must be a valid object",
                });
            }

            // Validate address structure
            const addressFields = {};

            if (address.houseNo !== undefined) {
                addressFields.houseNo =
                    typeof address.houseNo === "string"
                        ? address.houseNo.trim()
                        : "";
            }

            if (address.street !== undefined) {
                addressFields.street =
                    typeof address.street === "string"
                        ? address.street.trim()
                        : "";
            }

            if (address.area !== undefined) {
                addressFields.area =
                    typeof address.area === "string" ? address.area.trim() : "";
            }

            if (address.city !== undefined) {
                addressFields.city =
                    typeof address.city === "string" ? address.city.trim() : "";
            }

            if (address.state !== undefined) {
                addressFields.state =
                    typeof address.state === "string"
                        ? address.state.trim()
                        : "";
            }

            if (address.pincode !== undefined) {
                addressFields.pincode =
                    typeof address.pincode === "string"
                        ? address.pincode.trim()
                        : "";
            }

            if (address.coordinates !== undefined) {
                if (
                    typeof address.coordinates === "object" &&
                    address.coordinates !== null
                ) {
                    addressFields.coordinates = {};
                    if (address.coordinates.latitude !== undefined) {
                        addressFields.coordinates.latitude = String(
                            address.coordinates.latitude
                        );
                    }
                    if (address.coordinates.longitude !== undefined) {
                        addressFields.coordinates.longitude = String(
                            address.coordinates.longitude
                        );
                    }
                }
            }

            updateFields.address = addressFields;
        }

        // Check if at least one field is being updated
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update",
            });
        }

        // Check if phone number already exists (if phone is being updated)
        if (phone) {
            const existingUser = await User.findOne({
                phone: phone,
                _id: { $ne: userId },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Phone number is already registered with another account",
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            {
                new: true, // Return updated document
                runValidators: true, // Run schema validators
            }
        ).select("-password -otp"); // Exclude sensitive fields

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors,
            });
        }

        // Handle duplicate key error (phone)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Phone number is already registered",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .select("-password -otp")
            .populate(
                "workerProfile.verification.serviceAgentId",
                "name email phone"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

export {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    getProfile,
    changePassword,
};
