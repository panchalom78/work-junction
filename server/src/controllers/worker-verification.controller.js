import User from "../models/user.model.js";
import {
    successResponse,
    errorResponse,
    formatUserResponse,
} from "../utils/response.js";
import { deleteFromCloudinary, extractPublicId } from "../config/cloudinary.js";

/**
 * @desc    Upload selfie for worker verification
 * @route   POST /api/worker/verification/upload-selfie
 * @access  Private (Worker only)
 */
const uploadSelfie = async (req, res) => {
    try {
        const workerId = req.user._id;

        if (!req.file) {
            return errorResponse(res, 400, "Selfie image is required");
        }

        const user = await User.findById(workerId);

        if (!user || user.role !== "WORKER") {
            return errorResponse(
                res,
                403,
                "Only workers can upload verification documents"
            );
        }

        // Delete old selfie if exists
        if (user.workerProfile?.verification?.selfieUrl) {
            const oldPublicId = extractPublicId(
                user.workerProfile.verification.selfieUrl
            );
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId);
            }
        }

        // Initialize workerProfile and verification if not exists
        if (!user.workerProfile) {
            user.workerProfile = {};
        }
        if (!user.workerProfile.verification) {
            user.workerProfile.verification = {};
        }

        // Update selfie URL
        user.workerProfile.verification.selfieUrl = req.file.path;
        user.workerProfile.verification.isSelfieVerified = false;

        await user.save();

        return successResponse(res, 200, "Selfie uploaded successfully", {
            selfieUrl: req.file.path,
            message:
                "Your selfie has been uploaded and is pending verification",
        });
    } catch (error) {
        console.error("Upload selfie error:", error);
        return errorResponse(res, 500, "Failed to upload selfie");
    }
};

/**
 * @desc    Upload Aadhar document for worker verification
 * @route   POST /api/worker/verification/upload-aadhar
 * @access  Private (Worker only)
 */
const uploadAadhar = async (req, res) => {
    try {
        const workerId = req.user._id;

        if (!req.file) {
            return errorResponse(res, 400, "Aadhar document is required");
        }

        const user = await User.findById(workerId);

        if (!user || user.role !== "WORKER") {
            return errorResponse(
                res,
                403,
                "Only workers can upload verification documents"
            );
        }

        // Delete old Aadhar if exists
        if (user.workerProfile?.verification?.addharDocUrl) {
            const oldPublicId = extractPublicId(
                user.workerProfile.verification.addharDocUrl
            );
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId);
            }
        }

        // Initialize workerProfile and verification if not exists
        if (!user.workerProfile) {
            user.workerProfile = {};
        }
        if (!user.workerProfile.verification) {
            user.workerProfile.verification = {};
        }

        // Update Aadhar URL
        user.workerProfile.verification.addharDocUrl = req.file.path;
        user.workerProfile.verification.isAddharDocVerified = false;

        await user.save();

        return successResponse(
            res,
            200,
            "Aadhar document uploaded successfully",
            {
                aadharUrl: req.file.path,
                message:
                    "Your Aadhar document has been uploaded and is pending verification",
            }
        );
    } catch (error) {
        console.error("Upload Aadhar error:", error);
        return errorResponse(res, 500, "Failed to upload Aadhar document");
    }
};

/**
 * @desc    Upload police verification document
 * @route   POST /api/worker/verification/upload-police-verification
 * @access  Private (Worker only)
 */
const uploadPoliceVerification = async (req, res) => {
    try {
        const workerId = req.user._id;

        if (!req.file) {
            return errorResponse(
                res,
                400,
                "Police verification document is required"
            );
        }

        const user = await User.findById(workerId);

        if (!user || user.role !== "WORKER") {
            return errorResponse(
                res,
                403,
                "Only workers can upload verification documents"
            );
        }

        // Delete old police verification if exists
        if (user.workerProfile?.verification?.policeVerificationDocUrl) {
            const oldPublicId = extractPublicId(
                user.workerProfile.verification.policeVerificationDocUrl
            );
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId);
            }
        }

        // Initialize workerProfile and verification if not exists
        if (!user.workerProfile) {
            user.workerProfile = {};
        }
        if (!user.workerProfile.verification) {
            user.workerProfile.verification = {};
        }

        // Update police verification URL
        user.workerProfile.verification.policeVerificationDocUrl =
            req.file.path;
        user.workerProfile.verification.isPoliceVerificationDocVerified = false;

        await user.save();

        return successResponse(
            res,
            200,
            "Police verification document uploaded successfully",
            {
                policeVerificationUrl: req.file.path,
                message:
                    "Your police verification document has been uploaded and is pending verification",
            }
        );
    } catch (error) {
        console.error("Upload police verification error:", error);
        return errorResponse(
            res,
            500,
            "Failed to upload police verification document"
        );
    }
};

/**
 * @desc    Upload all verification documents at once
 * @route   POST /api/worker/verification/upload-all
 * @access  Private (Worker only)
 */
const uploadAllDocuments = async (req, res) => {
    try {
        const workerId = req.user._id;

        if (!req.files || Object.keys(req.files).length === 0) {
            return errorResponse(res, 400, "At least one document is required");
        }

        const user = await User.findById(workerId);

        if (!user || user.role !== "WORKER") {
            return errorResponse(
                res,
                403,
                "Only workers can upload verification documents"
            );
        }

        // Initialize workerProfile and verification if not exists
        if (!user.workerProfile) {
            user.workerProfile = {};
        }
        if (!user.workerProfile.verification) {
            user.workerProfile.verification = {};
        }

        const uploadedDocs = {};

        // Upload selfie
        if (req.files.selfie && req.files.selfie[0]) {
            // Delete old selfie if exists
            if (user.workerProfile.verification.selfieUrl) {
                const oldPublicId = extractPublicId(
                    user.workerProfile.verification.selfieUrl
                );
                if (oldPublicId) {
                    await deleteFromCloudinary(oldPublicId);
                }
            }
            user.workerProfile.verification.selfieUrl =
                req.files.selfie[0].path;
            user.workerProfile.verification.isSelfieVerified = false;
            uploadedDocs.selfie = req.files.selfie[0].path;
        }

        // Upload Aadhar
        if (req.files.aadhar && req.files.aadhar[0]) {
            // Delete old Aadhar if exists
            if (user.workerProfile.verification.addharDocUrl) {
                const oldPublicId = extractPublicId(
                    user.workerProfile.verification.addharDocUrl
                );
                if (oldPublicId) {
                    await deleteFromCloudinary(oldPublicId);
                }
            }
            user.workerProfile.verification.addharDocUrl =
                req.files.aadhar[0].path;
            user.workerProfile.verification.isAddharDocVerified = false;
            uploadedDocs.aadhar = req.files.aadhar[0].path;
        }

        // Upload police verification
        if (req.files.policeVerification && req.files.policeVerification[0]) {
            // Delete old police verification if exists
            if (user.workerProfile.verification.policeVerificationDocUrl) {
                const oldPublicId = extractPublicId(
                    user.workerProfile.verification.policeVerificationDocUrl
                );
                if (oldPublicId) {
                    await deleteFromCloudinary(oldPublicId);
                }
            }
            user.workerProfile.verification.policeVerificationDocUrl =
                req.files.policeVerification[0].path;
            user.workerProfile.verification.isPoliceVerificationDocVerified = false;
            uploadedDocs.policeVerification =
                req.files.policeVerification[0].path;
        }

        // Set verification status to PENDING
        user.workerProfile.verification.status = "PENDING";

        await user.save();

        return successResponse(res, 200, "Documents uploaded successfully", {
            uploadedDocuments: uploadedDocs,
            verificationStatus: "PENDING",
            message:
                "Your documents have been uploaded and are pending verification",
        });
    } catch (error) {
        console.error("Upload all documents error:", error);
        return errorResponse(res, 500, "Failed to upload documents");
    }
};

/**
 * @desc    Get worker verification status
 * @route   GET /api/worker/verification/status
 * @access  Private (Worker only)
 */
const getVerificationStatus = async (req, res) => {
    try {
        const workerId = req.user._id;

        const user = await User.findById(workerId);

        if (!user || user.role !== "WORKER") {
            return errorResponse(
                res,
                403,
                "Only workers can check verification status"
            );
        }

        const verification = user.workerProfile?.verification || {};

        const status = {
            overallStatus: verification.status || "PENDING",
            documents: {
                selfie: {
                    uploaded: !!verification.selfieUrl,
                    url: verification.selfieUrl || null,
                    verified: verification.isSelfieVerified || false,
                },
                aadhar: {
                    uploaded: !!verification.addharDocUrl,
                    url: verification.addharDocUrl || null,
                    verified: verification.isAddharDocVerified || false,
                },
                policeVerification: {
                    uploaded: !!verification.policeVerificationDocUrl,
                    url: verification.policeVerificationDocUrl || null,
                    verified:
                        verification.isPoliceVerificationDocVerified || false,
                },
            },
            rejectionReason: verification.rejectionReason || null,
            verificationId: verification.verificationId || null,
        };

        return successResponse(
            res,
            200,
            "Verification status retrieved successfully",
            status
        );
    } catch (error) {
        console.error("Get verification status error:", error);
        return errorResponse(res, 500, "Failed to get verification status");
    }
};

/**
 * @desc    Delete a verification document
 * @route   DELETE /api/worker/verification/:documentType
 * @access  Private (Worker only)
 */
const deleteDocument = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { documentType } = req.params;

        const validTypes = ["selfie", "aadhar", "policeVerification"];
        if (!validTypes.includes(documentType)) {
            return errorResponse(res, 400, "Invalid document type");
        }

        const user = await User.findById(workerId);

        if (!user || user.role !== "WORKER") {
            return errorResponse(
                res,
                403,
                "Only workers can delete verification documents"
            );
        }

        if (!user.workerProfile?.verification) {
            return errorResponse(res, 404, "No verification documents found");
        }

        let documentUrl;
        let fieldName;

        switch (documentType) {
            case "selfie":
                documentUrl = user.workerProfile.verification.selfieUrl;
                fieldName = "selfieUrl";
                break;
            case "aadhar":
                documentUrl = user.workerProfile.verification.addharDocUrl;
                fieldName = "addharDocUrl";
                break;
            case "policeVerification":
                documentUrl =
                    user.workerProfile.verification.policeVerificationDocUrl;
                fieldName = "policeVerificationDocUrl";
                break;
        }

        if (!documentUrl) {
            return errorResponse(
                res,
                404,
                `${documentType} document not found`
            );
        }

        // Delete from Cloudinary
        const publicId = extractPublicId(documentUrl);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }

        // Remove from database
        user.workerProfile.verification[fieldName] = undefined;
        await user.save();

        return successResponse(
            res,
            200,
            `${documentType} document deleted successfully`
        );
    } catch (error) {
        console.error("Delete document error:", error);
        return errorResponse(res, 500, "Failed to delete document");
    }
};

export {
    uploadSelfie,
    uploadAadhar,
    uploadPoliceVerification,
    uploadAllDocuments,
    getVerificationStatus,
    deleteDocument,
};
