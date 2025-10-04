import { verifyToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";
import User from "../models/user.model.js";

/**
 * Protect routes - verify JWT token from cookie
 */
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return errorResponse(res, 401, "Not authorized, no token");
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return errorResponse(res, 401, "User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);

        return errorResponse(res, 401, "Not authorized, token failed");
    }
};

/**
 * Authorize specific roles
 * @param  {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, "Not authorized");
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(
                res,
                403,
                `Role '${req.user.role}' is not authorized to access this route`
            );
        }

        next();
    };
};

/**
 * Optional authentication - attach user if token exists
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (token) {
            const decoded = verifyToken(token);
            const user = await findById(decoded.id).select("-password");

            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Continue without user
    }

    next();
};

export { protect, authorize, optionalAuth };
