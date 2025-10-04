import { MulterError } from "multer";
import { errorResponse } from "../utils/response.js";

/**
 * Handle Multer errors
 */
const handleMulterError = (err, req, res, next) => {
    if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return errorResponse(
                res,
                400,
                "File size is too large. Maximum size is 10MB."
            );
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return errorResponse(res, 400, "Unexpected field in upload.");
        }
        return errorResponse(res, 400, `Upload error: ${err.message}`);
    }

    if (err) {
        console.log(err);
        return errorResponse(res, 400, err.message || "File upload failed");
    }

    next();
};

/**
 * Validate file type
 */
const validateFileType = (allowedTypes) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return next();
        }

        const files = req.files ? Object.values(req.files).flat() : [req.file];

        for (const file of files) {
            if (file) {
                const fileType = file.mimetype.split("/")[0];
                const fileExt = file.mimetype.split("/")[1];

                if (
                    !allowedTypes.includes(fileType) &&
                    !allowedTypes.includes(fileExt)
                ) {
                    return errorResponse(
                        res,
                        400,
                        `Invalid file type. Allowed types: ${allowedTypes.join(
                            ", "
                        )}`
                    );
                }
            }
        }

        next();
    };
};

/**
 * Ensure file is uploaded
 */
const requireFile = (fieldName) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return errorResponse(res, 400, `${fieldName} is required`);
        }

        if (req.files && !req.files[fieldName]) {
            return errorResponse(res, 400, `${fieldName} is required`);
        }

        next();
    };
};

/**
 * Validate image dimensions (optional)
 */
const validateImageDimensions = (minWidth, minHeight) => {
    return async (req, res, next) => {
        if (!req.file || !req.file.mimetype.startsWith("image/")) {
            return next();
        }

        try {
            const sizeOf = require("image-size");
            const dimensions = sizeOf(req.file.buffer);

            if (dimensions.width < minWidth || dimensions.height < minHeight) {
                return errorResponse(
                    res,
                    400,
                    `Image dimensions must be at least ${minWidth}x${minHeight}px`
                );
            }

            next();
        } catch (error) {
            next();
        }
    };
};

export {
    handleMulterError,
    validateFileType,
    requireFile,
    validateImageDimensions,
};
