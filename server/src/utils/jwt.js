import jwt from "jsonwebtoken";

const { sign, verify } = jwt;
/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
    return sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

/**
 * Generate token and set HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 */
const generateTokenAndSetCookie = (res, user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };

    const token = generateToken(payload);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:
            (parseInt(process.env.COOKIE_EXPIRES_DAYS) || 7) *
            24 *
            60 *
            60 *
            1000,
    };

    res.cookie("token", token, cookieOptions);

    return token;
};

/**
 * Clear authentication cookie
 * @param {Object} res - Express response object
 */
const clearAuthCookie = (res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
};

export {
    generateToken,
    verifyToken,
    generateTokenAndSetCookie,
    clearAuthCookie,
};
