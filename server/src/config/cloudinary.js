import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { config } from "dotenv";

config();
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for verification documents
const verificationStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "worker-verification",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        resource_type: "auto",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
});

// Storage configuration for selfies
const selfieStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "worker-selfies",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
        ],
    },
});

// Storage configuration for Aadhar documents
const aadharStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "worker-aadhar",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        resource_type: "auto",
        transformation: [{ quality: "auto" }],
    },
});

// Storage configuration for police verification documents
const policeVerificationStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "worker-police-verification",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        resource_type: "auto",
        transformation: [{ quality: "auto" }],
    },
});

// Multer upload instances
const uploadSelfie = multer({
    storage: selfieStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

const uploadAadhar = multer({
    storage: aadharStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

const uploadPoliceVerification = multer({
    storage: policeVerificationStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

// Generic verification document upload
const uploadVerificationDoc = multer({
    storage: verificationStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw error;
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 */
const extractPublicId = (url) => {
    if (!url) return null;

    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];

    // Include folder path if exists
    const folderIndex = parts.indexOf("upload");
    if (folderIndex !== -1 && folderIndex < parts.length - 2) {
        const folder = parts.slice(folderIndex + 2, -1).join("/");
        return folder ? `${folder}/${publicId}` : publicId;
    }

    return publicId;
};

const portfolioStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "worker-portfolio",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ quality: "auto" }],
    },
});

const uploadPortfolio = multer({
    storage: portfolioStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export {
    cloudinary,
    uploadSelfie,
    uploadAadhar,
    uploadPortfolio,
    uploadPoliceVerification,
    uploadVerificationDoc,
    deleteFromCloudinary,
    extractPublicId,
};
