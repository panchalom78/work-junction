/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
const successResponse = (res, statusCode = 200, message, data = null) => {
    const response = {
        success: true,
        message,
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Array} errors - Array of error details
 */
const errorResponse = (res, statusCode = 500, message, errors = null) => {
    const response = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Format user data (remove sensitive fields)
 * @param {Object} user - User document
 * @returns {Object} Formatted user data
 */
const formatUserResponse = (user) => {
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
};

export { successResponse, errorResponse, formatUserResponse };
