import { successResponse, errorResponse } from "../utils/response.js";
import User from "../models/user.model.js";

/**
 * @desc    Get all pending verifications (filtered by assigned area for service agents)
 * @route   GET /api/service-agent/verifications/pending
 * @access  Private (Service Agent/Admin only)
 */
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

/**
 * @desc    Get worker verification details (with area access check)
 * @route   GET /api/service-agent/verifications/:workerId
 * @access  Private (Service Agent/Admin only)
 */
const getWorkerVerificationDetails = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        }).select("name email phone address workerProfile createdAt");

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
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

            // Check if worker is in the service agent's assigned area
            if (workerArea !== assignedArea && workerCity !== assignedArea) {
                return errorResponse(
                    res,
                    403,
                    `Access denied. This worker is not in your assigned area (${assignedArea}). Worker location: ${
                        workerCity || workerArea || "Unknown"
                    }`
                );
            }
        }
        // ADMIN has access to all workers

        return successResponse(
            res,
            200,
            "Worker verification details retrieved successfully",
            {
                worker: {
                    id: worker._id,
                    name: worker.name,
                    email: worker.email,
                    phone: worker.phone,
                    address: worker.address,
                    registeredAt: worker.createdAt,
                    verification: worker.workerProfile?.verification || {},
                },
            }
        );
    } catch (error) {
        console.error("Get worker verification details error:", error);
        return errorResponse(
            res,
            500,
            "Failed to get worker verification details"
        );
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

export {
    getPendingVerifications,
    getWorkerVerificationDetails,
    approveVerification,
    rejectVerification,
    getVerificationStats,
    getMyAreaWorkers,
};
