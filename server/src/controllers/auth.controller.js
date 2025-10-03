import User from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateTokenAndSetCookie, clearAuthCookie } from "../utils/jwt.js";
import {
    successResponse,
    errorResponse,
    formatUserResponse,
} from "../utils/response.js";

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { email, password, name, phone, role, address } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return errorResponse(res, 400, "Email already registered");
            }
            return errorResponse(res, 400, "Phone number already registered");
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone,
            role,
            address: address || {},
        });

        generateTokenAndSetCookie(res, user);

        return successResponse(
            res,
            201,
            "User registered successfully",
            formatUserResponse(user)
        );
    } catch (error) {
        console.error("Register error:", error);
        return errorResponse(res, 500, "Server error during registration");
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
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) {
            const existingUser = await User.findOne({
                phone,
                _id: { $ne: req.user._id },
            });

            if (existingUser) {
                return errorResponse(res, 400, "Phone number already in use");
            }
            updateData.phone = phone;
        }
        if (address) updateData.address = address;

        const user = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        return successResponse(
            res,
            200,
            "Profile updated successfully",
            formatUserResponse(user)
        );
    } catch (error) {
        console.error("Update profile error:", error);
        return errorResponse(res, 500, "Server error during profile update");
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

export { register, login, logout, getMe, updateProfile, changePassword };
