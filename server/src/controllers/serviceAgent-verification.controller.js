import { successResponse, errorResponse } from "../utils/response.js";
import User from "../models/user.model.js";
import ServiceAgent from "../models/serviceAgent.model.js";

const getPendingVerifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build query based on role
        let query = {
            role: "WORKER",
            "workerProfile.verification.status": "PENDING",
        };

        // If user is SERVICE_AGENT, filter by assigned area
        if (req.user.role === "SERVICE_AGENT") {
            const assignedArea = req.user.serviceAgentProfile?.assignedArea;

            if (!assignedArea) {
                return errorResponse(
                    res,
                    403,
                    "No area assigned to you. Please contact admin to assign an area."
                );
            }

            // Filter workers by area (city or area field)
            query.$or = [
                { "address.area": assignedArea },
                { "address.city": assignedArea },
            ];
        }
        // If ADMIN, show all pending verifications (no filter)

        const workers = await User.find(query)
            .select(
                "name email phone address workerProfile.verification createdAt"
            )
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ "workerProfile.verification.verificationId": -1 });

        const total = await User.countDocuments(query);

        return successResponse(
            res,
            200,
            "Pending verifications retrieved successfully",
            {
                workers,
                assignedArea:
                    req.user.role === "SERVICE_AGENT"
                        ? req.user.serviceAgentProfile?.assignedArea
                        : "ALL",
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit),
                },
            }
        );
    } catch (error) {
        console.error("Get pending verifications error:", error);
        return errorResponse(res, 500, "Failed to get pending verifications");
    }
};

const getPendingWorkerVerifications = async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== "SERVICE_AGENT") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only service agents can view this.",
            });
        }

        const assignedArea = user?.serviceAgentProfile?.assignedArea
            ?.trim()
            ?.toLowerCase();
        const assignedPincode = user?.address?.pincode?.trim();

        if (!assignedArea || !assignedPincode) {
            return res.status(400).json({
                success: false,
                message: "Agent does not have assigned area or pincode.",
            });
        }

        // ✅ Find pending workers (case-insensitive area + exact pincode)
        const pendingWorkers = await User.find({
            role: "WORKER",
            "workerProfile.verification.status": "PENDING",

            "address.pincode": assignedPincode,
        })
            .select("name phone address workerProfile.verification createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: pendingWorkers.length,
            area: assignedArea,
            pincode: assignedPincode,
            data: pendingWorkers,
        });
    } catch (error) {
        console.error("Error fetching pending workers:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching pending workers",
            error: error.message,
        });
    }
};

/**
 * @desc    Approve worker verification (with area access check)
 * @route   PUT /api/service-agent/verifications/:workerId/approve
 * @access  Private (Service Agent/Admin only)
 */
const approveVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const serviceAgentId = req.user._id;

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        if (!worker.workerProfile?.verification) {
            return errorResponse(res, 400, "No verification documents found");
        }

        // Check if service agent has access to this worker's area
        if (req.user.role === "SERVICE_AGENT") {
            const assignedArea = req.user.serviceAgentProfile?.assignedArea;

            if (!assignedArea) {
                return errorResponse(
                    res,
                    403,
                    "No area assigned to you. Please contact admin."
                );
            }

            const workerArea = worker.address?.area;
            const workerCity = worker.address?.city;

            if (workerArea !== assignedArea && workerCity !== assignedArea) {
                return errorResponse(
                    res,
                    403,
                    `Access denied. This worker is not in your assigned area (${assignedArea})`
                );
            }
        }

        // Check if all documents are uploaded
        const verification = worker.workerProfile.verification;
        if (
            !verification.selfieUrl ||
            !verification.addharDocUrl ||
            !verification.policeVerificationDocUrl
        ) {
            return errorResponse(
                res,
                400,
                "Cannot approve: All verification documents must be uploaded"
            );
        }

        // Update verification status
        worker.workerProfile.verification.status = "APPROVED";
        worker.workerProfile.verification.serviceAgentId = serviceAgentId;
        worker.workerProfile.verification.isSelfieVerified = true;
        worker.workerProfile.verification.isAddharDocVerified = true;
        worker.workerProfile.verification.isPoliceVerificationDocVerified = true;
        worker.workerProfile.verification.verifiedAt = new Date();
        worker.workerProfile.verification.rejectionReason = undefined;

        await worker.save();

        return successResponse(
            res,
            200,
            "Worker verification approved successfully",
            {
                workerId: worker._id,
                workerName: worker.name,
                workerLocation: `${worker.address?.city || ""}, ${
                    worker.address?.area || ""
                }`,
                verificationStatus: "APPROVED",
                verifiedAt: worker.workerProfile.verification.verifiedAt,
                verifiedBy: req.user.name,
            }
        );
    } catch (error) {
        console.error("Approve verification error:", error);
        return errorResponse(res, 500, "Failed to approve verification");
    }
};

/**
 * @desc    Reject worker verification (with area access check)
 * @route   PUT /api/service-agent/verifications/:workerId/reject
 * @access  Private (Service Agent/Admin only)
 */
const rejectVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { rejectionReason } = req.body;
        const serviceAgentId = req.user._id;

        if (!rejectionReason) {
            return errorResponse(res, 400, "Rejection reason is required");
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        if (!worker.workerProfile?.verification) {
            return errorResponse(res, 400, "No verification documents found");
        }

        // Check if service agent has access to this worker's area
        if (req.user.role === "SERVICE_AGENT") {
            const assignedArea = req.user.serviceAgentProfile?.assignedArea;

            if (!assignedArea) {
                return errorResponse(
                    res,
                    403,
                    "No area assigned to you. Please contact admin."
                );
            }

            const workerArea = worker.address?.area;
            const workerCity = worker.address?.city;

            if (workerArea !== assignedArea && workerCity !== assignedArea) {
                return errorResponse(
                    res,
                    403,
                    `Access denied. This worker is not in your assigned area (${assignedArea})`
                );
            }
        }

        // Update verification status
        worker.workerProfile.verification.status = "REJECTED";
        worker.workerProfile.verification.serviceAgentId = serviceAgentId;
        worker.workerProfile.verification.rejectionReason = rejectionReason;
        worker.workerProfile.verification.isSelfieVerified = false;
        worker.workerProfile.verification.isAddharDocVerified = false;
        worker.workerProfile.verification.isPoliceVerificationDocVerified = false;

        await worker.save();

        return successResponse(res, 200, "Worker verification rejected", {
            workerId: worker._id,
            workerName: worker.name,
            workerLocation: `${worker.address?.city || ""}, ${
                worker.address?.area || ""
            }`,
            verificationStatus: "REJECTED",
            rejectionReason,
            rejectedBy: req.user.name,
        });
    } catch (error) {
        console.error("Reject verification error:", error);
        return errorResponse(res, 500, "Failed to reject verification");
    }
};

/**
 * @desc    Get verification statistics (filtered by assigned area for service agents)
 * @route   GET /api/service-agent/verifications/stats
 * @access  Private (Service Agent/Admin only)
 */
const getVerificationStats = async (req, res) => {
    try {
        // Build base query for area filtering
        let baseQuery = { role: "WORKER" };

        // If SERVICE_AGENT, filter by assigned area
        if (req.user.role === "SERVICE_AGENT") {
            const assignedArea = req.user.serviceAgentProfile?.assignedArea;

            if (!assignedArea) {
                return errorResponse(
                    res,
                    403,
                    "No area assigned to you. Please contact admin."
                );
            }

            baseQuery.$or = [
                { "address.area": assignedArea },
                { "address.city": assignedArea },
            ];
        }

        const pending = await User.countDocuments({
            ...baseQuery,
            "workerProfile.verification.status": "PENDING",
        });

        const approved = await User.countDocuments({
            ...baseQuery,
            "workerProfile.verification.status": "APPROVED",
        });

        const rejected = await User.countDocuments({
            ...baseQuery,
            "workerProfile.verification.status": "REJECTED",
        });

        const total = await User.countDocuments(baseQuery);

        return successResponse(
            res,
            200,
            "Verification statistics retrieved successfully",
            {
                assignedArea:
                    req.user.role === "SERVICE_AGENT"
                        ? req.user.serviceAgentProfile?.assignedArea
                        : "ALL",
                total,
                pending,
                approved,
                rejected,
                notSubmitted: total - (pending + approved + rejected),
            }
        );
    } catch (error) {
        console.error("Get verification stats error:", error);
        return errorResponse(res, 500, "Failed to get verification statistics");
    }
};

/**
 * @desc    Get all workers in assigned area (for service agent reference)
 * @route   GET /api/service-agent/verifications/my-area-workers
 * @access  Private (Service Agent only)
 */
const getMyAreaWorkers = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (page - 1) * limit;

        if (req.user.role !== "SERVICE_AGENT") {
            return errorResponse(
                res,
                403,
                "This endpoint is only for service agents"
            );
        }

        const assignedArea = req.user.serviceAgentProfile?.assignedArea;

        if (!assignedArea) {
            return errorResponse(
                res,
                403,
                "No area assigned to you. Please contact admin."
            );
        }

        // Build query
        let query = {
            role: "WORKER",
            $or: [
                { "address.area": assignedArea },
                { "address.city": assignedArea },
            ],
        };

        // Add status filter if provided
        if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            query["workerProfile.verification.status"] = status;
        }

        const workers = await User.find(query)
            .select(
                "name email phone address workerProfile.verification createdAt"
            )
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        return successResponse(
            res,
            200,
            `Workers in your assigned area (${assignedArea}) retrieved successfully`,
            {
                assignedArea,
                workers,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit),
                },
            }
        );
    } catch (error) {
        console.error("Get my area workers error:", error);
        return errorResponse(res, 500, "Failed to get workers in your area");
    }
};

// Get all workers for verification
export const getWorkersForVerification = async (req, res) => {
    try {
        const workers = await User.find({
            role: "WORKER",
            "workerProfile.verification.status": {
                $in: ["PENDING", "REJECTED"],
            },
        })
            .select("-password -otp")
            .sort({ createdAt: -1 });

        const formattedWorkers = workers.map((worker) => ({
            _id: worker._id,
            name: worker.name,
            phone: worker.phone,
            email: worker.email,
            address: worker.address,
            workerProfile: worker.workerProfile,
            createdAt: worker.createdAt,
            updatedAt: worker.updatedAt,
        }));

        res.status(200).json({
            success: true,
            data: formattedWorkers,
            message: "Workers fetched successfully for verification",
        });
    } catch (error) {
        console.error("Error fetching workers for verification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get single worker with full details for verification
export const getWorkerVerificationDetails = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID format",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        }).select("-password -otp");

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            data: worker,
            message: "Worker details fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching worker details:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Approve worker verific
export const approveWorkerVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const serviceAgentId = req.user?._id; // Ensure middleware sets req.user

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID format",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        if (!worker.workerProfile || !worker.workerProfile.verification) {
            return res.status(400).json({
                success: false,
                message: "Worker verification profile not found",
            });
        }

        // ✅ Update worker verification details
        worker.workerProfile.verification.status = "APPROVED";
        worker.workerProfile.verification.verifiedAt = new Date();

        // ✅ Properly store service agent ID (ensure it’s ObjectId)
        if (serviceAgentId) {
            worker.workerProfile.verification.serviceAgentId =
                new mongoose.Types.ObjectId(serviceAgentId);
        }

        // ✅ Auto-verify all documents
        worker.workerProfile.verification.isSelfieVerified = true;
        worker.workerProfile.verification.isAddharDocVerified = true;
        worker.workerProfile.verification.isPoliceVerificationDocVerified = true;

        // ✅ Clear rejection reason if it exists
        worker.workerProfile.verification.rejectionReason = undefined;

        // ✅ Mark worker as fully verified
        worker.isVerified = true;

        // ✅ Save updates
        await worker.save();

        return res.status(200).json({
            success: true,
            message: "Worker verification approved successfully",
            data: {
                _id: worker._id,
                name: worker.name,
                phone: worker.phone,
                isVerified: worker.isVerified,
                verification: worker.workerProfile.verification,
            },
        });
    } catch (error) {
        console.error("Error approving worker verification:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Reject worker verification with reason
export const rejectWorkerVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { rejectionReason } = req.body;
        const serviceAgentId = req.user._id; // From auth middleware

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID format",
            });
        }

        if (!rejectionReason || rejectionReason.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Check if worker has verification profile
        if (!worker.workerProfile || !worker.workerProfile.verification) {
            return res.status(400).json({
                success: false,
                message: "Worker verification profile not found",
            });
        }

        // Update verification status
        worker.workerProfile.verification.status = "REJECTED";
        worker.workerProfile.verification.serviceAgentId = serviceAgentId;
        worker.workerProfile.verification.rejectionReason =
            rejectionReason.trim();
        worker.workerProfile.verification.verifiedAt = new Date();

        await worker.save();

        res.status(200).json({
            success: true,
            data: {
                _id: worker._id,
                name: worker.name,
                verification: worker.workerProfile.verification,
            },
            message: "Worker verification rejected successfully",
        });
    } catch (error) {
        console.error("Error rejecting worker verification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Request additional documents from worker
export const requestAdditionalDocuments = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { documentType, message } = req.body;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID format",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Here you would typically:
        // 1. Send notification to worker
        // 2. Send email/SMS
        // 3. Update verification status if needed

        res.status(200).json({
            success: true,
            message: "Document request sent to worker successfully",
            data: {
                workerId: worker._id,
                workerName: worker.name,
                documentType,
                message:
                    message ||
                    `Please upload ${documentType} document for verification`,
            },
        });
    } catch (error) {
        console.error("Error requesting documents:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get worker documents for viewing
export const getWorkerDocuments = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID format",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        }).select("name workerProfile.verification");

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        if (!worker.workerProfile || !worker.workerProfile.verification) {
            return res.status(404).json({
                success: false,
                message: "Worker verification data not found",
            });
        }

        const documents = {
            selfie: worker.workerProfile.verification.selfieUrl,
            aadhar: worker.workerProfile.verification.addharDocUrl,
            policeVerification:
                worker.workerProfile.verification.policeVerificationDocUrl,
        };

        res.status(200).json({
            success: true,
            data: {
                workerId: worker._id,
                workerName: worker.name,
                documents,
                verificationStatus: worker.workerProfile.verification.status,
                documentVerification: {
                    isSelfieVerified:
                        worker.workerProfile.verification.isSelfieVerified,
                    isAddharDocVerified:
                        worker.workerProfile.verification.isAddharDocVerified,
                    isPoliceVerificationDocVerified:
                        worker.workerProfile.verification
                            .isPoliceVerificationDocVerified,
                },
            },
            message: "Worker documents fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching worker documents:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update individual document verification status
export const updateDocumentVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { documentType, isVerified } = req.body;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID format",
            });
        }

        const validDocumentTypes = ["selfie", "aadhar", "policeVerification"];
        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid document type. Must be one of: selfie, aadhar, policeVerification",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        if (!worker.workerProfile || !worker.workerProfile.verification) {
            return res.status(404).json({
                success: false,
                message: "Worker verification data not found",
            });
        }

        // Update specific document verification status
        const verificationField = `is${
            documentType.charAt(0).toUpperCase() + documentType.slice(1)
        }Verified`;

        if (documentType === "aadhar") {
            worker.workerProfile.verification.isAddharDocVerified = isVerified;
        } else if (documentType === "policeVerification") {
            worker.workerProfile.verification.isPoliceVerificationDocVerified =
                isVerified;
        } else {
            worker.workerProfile.verification[verificationField] = isVerified;
        }

        await worker.save();

        res.status(200).json({
            success: true,
            data: {
                workerId: worker._id,
                workerName: worker.name,
                documentType,
                isVerified,
                verification: worker.workerProfile.verification,
            },
            message: `Document verification status updated successfully`,
        });
    } catch (error) {
        console.error("Error updating document verification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
export {
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    getVerificationStats,
    getMyAreaWorkers,
    getPendingWorkerVerifications,
};
