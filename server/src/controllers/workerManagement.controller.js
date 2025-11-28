import mongoose from "mongoose";
import User from "../models/user.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import ServiceAgent from "../models/serviceAgent.model.js";
import { Skill } from "../models/skill.model.js";

/* ------------------------- 🧩 1. GET ALL WORKERS ------------------------- */
// ==================== GET ALL WORKERS ====================
/* ------------------------- 🧩 1. GET ALL WORKERS ------------------------- */
// ==================== GET ALL WORKERS ====================
export const getAllWorkers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status = "all",
            skill = "",
            service = "",
        } = req.query;

        const userId = req.user._id;
        // Base query for workers - only those verified by service agents
        const query = {
            role: "WORKER",
            "workerProfile.verification.serviceAgentId": {
                $exists: true,
                $eq: userId,
            },
        };

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { "address.area": { $regex: search, $options: "i" } },
                { "address.city": { $regex: search, $options: "i" } },
            ];
        }

        // Status filter
        if (status !== "all") {
            if (status === "suspended") {
                query["workerProfile.isSuspended"] = true;
            } else if (status === "active") {
                query["workerProfile.isSuspended"] = { $ne: true };
                query["workerProfile.verification.status"] = "APPROVED";
            } else if (status === "pending") {
                query["workerProfile.verification.status"] = "PENDING";
                // For pending, we still want serviceAgentId to exist (assigned but not approved)
                query["workerProfile.verification.serviceAgentId"] = {
                    $exists: true,
                    $ne: null,
                };
            } else if (status === "rejected") {
                query["workerProfile.verification.status"] = "REJECTED";
                // For rejected, we still want serviceAgentId to exist (was assigned but rejected)
                query["workerProfile.verification.serviceAgentId"] = {
                    $exists: true,
                    $ne: null,
                };
            }
        }

        console.log(
            "Query for service agent verified workers:",
            JSON.stringify(query, null, 2)
        );

        // Get workers with pagination
        const workers = await User.find(query)
            .select("-password -otp")
            .populate({
                path: "workerProfile.skills.skillId",
                select: "name description",
            })
            .populate({
                path: "workerProfile.verification.serviceAgentId",
                select: "name email phone",
            })
            .sort({ createdAt: -1 })
            .lean();

        // Get worker IDs for service lookup
        const workerIds = workers.map((worker) => worker._id);

        // Build service query
        const serviceQuery = { workerId: { $in: workerIds }, isActive: true };

        // Apply skill filter to services if specified
        if (skill) {
            serviceQuery.skillId = new mongoose.Types.ObjectId(skill);
        }

        // Apply service filter to services if specified
        if (service) {
            serviceQuery.serviceId = new mongoose.Types.ObjectId(service);
        }

        // Get worker services with filtering
        const workerServices = await WorkerService.find(serviceQuery)
            .populate({
                path: "skillId",
                select: "name description",
            })
            .lean();

        // Get all service IDs to fetch service names
        const serviceIds = [
            ...new Set(workerServices.map((ws) => ws.serviceId)),
        ];

        // Fetch service names from Skill model
        const servicesData = await Skill.aggregate([
            { $unwind: "$services" },
            { $match: { "services.serviceId": { $in: serviceIds } } },
            {
                $project: {
                    serviceId: "$services.serviceId",
                    serviceName: "$services.name",
                },
            },
        ]);

        // Create a map of serviceId to serviceName
        const serviceNameMap = {};
        servicesData.forEach((service) => {
            serviceNameMap[service.serviceId.toString()] = service.serviceName;
        });

        // Group services by workerId and calculate stats
        const servicesByWorker = {};
        const workerStats = {};

        workerServices.forEach((service) => {
            const workerId = service.workerId.toString();

            if (!servicesByWorker[workerId]) {
                servicesByWorker[workerId] = [];
            }
            servicesByWorker[workerId].push(service);

            // Initialize stats for worker
            if (!workerStats[workerId]) {
                workerStats[workerId] = {
                    totalServices: 0,
                    totalEarnings: 0,
                    totalRating: 0,
                };
            }

            workerStats[workerId].totalServices++;
            workerStats[workerId].totalEarnings += service.price || 0;
            workerStats[workerId].totalRating += service.rating || 0;
        });

        // Filter workers based on service criteria
        let filteredWorkers = workers;

        // If skill or service filter is applied, only include workers that have matching services
        if (skill || service) {
            filteredWorkers = workers.filter(
                (worker) => servicesByWorker[worker._id.toString()]?.length > 0
            );
        }

        // Transform the data
        const transformedWorkers = filteredWorkers.map((worker) => {
            const workerIdStr = worker._id.toString();
            const services = servicesByWorker[workerIdStr] || [];
            const stats = workerStats[workerIdStr] || {
                totalServices: 0,
                totalEarnings: 0,
                totalRating: 0,
            };

            const averageRating =
                stats.totalServices > 0
                    ? stats.totalRating / stats.totalServices
                    : 0;

            // Get worker's skills from workerProfile
            const skills =
                worker.workerProfile?.skills
                    ?.map((skillObj) => ({
                        _id: skillObj.skillId?._id,
                        name: skillObj.skillId?.name,
                        description: skillObj.skillId?.description,
                    }))
                    .filter((skill) => skill._id) || [];

            // Transform services for frontend with serviceName
            const transformedServices = services.map((service) => ({
                _id: service._id,
                serviceId: service.serviceId,
                skillId: service.skillId?._id,
                name: service.skillId?.name || "Unknown Service",
                serviceName:
                    serviceNameMap[service.serviceId.toString()] ||
                    "Unknown Service",
                details: service.details,
                pricingType: service.pricingType,
                price: service.price,
                estimatedDuration: service.estimatedDuration,
            }));

            // Get verification info
            const verification = worker.workerProfile?.verification || {};
            const serviceAgentInfo = verification.serviceAgentId
                ? {
                      _id: verification.serviceAgentId._id,
                      name: verification.serviceAgentId.name,
                      email: verification.serviceAgentId.email,
                      phone: verification.serviceAgentId.phone,
                  }
                : null;

            return {
                _id: worker._id,
                name: worker.name,
                phone: worker.phone,
                email: worker.email,
                address: worker.address,
                isActive: worker.isActive,
                isVerified: worker.isVerified,
                createdAt: worker.createdAt,
                updatedAt: worker.updatedAt,
                workerProfile: {
                    availabilityStatus:
                        worker.workerProfile?.availabilityStatus || "available",
                    skills: skills,
                    services: transformedServices,
                    verification: {
                        ...verification,
                        serviceAgentId: serviceAgentInfo,
                    },
                    bankDetails: worker.workerProfile?.bankDetails || {},
                    timetable: worker.workerProfile?.timetable || {},
                    nonAvailability:
                        worker.workerProfile?.nonAvailability || [],
                    isSuspended: worker.workerProfile?.isSuspended || false,
                    createdByAgent:
                        worker.workerProfile?.createdByAgent || false,
                },
                rating: parseFloat(averageRating.toFixed(1)),
                completedJobs: stats.totalServices,
                earnings: stats.totalEarnings,
                status: worker.workerProfile?.isSuspended
                    ? "suspended"
                    : worker.workerProfile?.verification?.status === "PENDING"
                    ? "pending"
                    : worker.workerProfile?.verification?.status === "REJECTED"
                    ? "rejected"
                    : "active",
                // Additional field to show which service agent verified this worker
                verifiedBy: serviceAgentInfo,
            };
        });

        res.status(200).json({
            success: true,
            data: transformedWorkers,
        });
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/* ---------------------- 🧩 2. GET SINGLE WORKER DETAILS ---------------------- */
export const getWorkerDetails = async (req, res) => {
    try {
        const { workerId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        // Fetch worker basic info
        const worker = await User.findById(workerId)
            .select("-password -otp")
            .populate({
                path: "workerProfile.skills.skillId",
                select: "name",
            });

        if (!worker || worker.role !== "WORKER") {
            return errorResponse(res, 404, "Worker not found");
        }

        // Fetch worker services directly from WorkerService model
        const workerServices = await WorkerService.find({ workerId })
            .populate("skillId", "name")
            .populate("serviceId", "name");

        // Alternative approach if serviceId is not directly populateable:
        // We need to get service names from Skill model
        const servicesWithNames = await Promise.all(
            workerServices.map(async (service) => {
                let serviceName = "Unknown Service";

                // Try to get service name from populated serviceId first
                if (service.serviceId && service.serviceId.name) {
                    serviceName = service.serviceId.name;
                } else {
                    // If not populated, fetch from Skill model
                    try {
                        const skill = await Skill.findOne({
                            "services.serviceId": service.serviceId,
                        });
                        if (skill) {
                            const serviceData = skill.services.find((s) =>
                                s.serviceId.equals(service.serviceId)
                            );
                            serviceName =
                                serviceData?.name || "Unknown Service";
                        }
                    } catch (error) {
                        console.error("Error fetching service name:", error);
                    }
                }

                return {
                    _id: service._id,
                    skillId: {
                        _id: service.skillId._id,
                        name: service.skillId.name,
                    },
                    serviceId: {
                        _id: service.serviceId,
                    },
                    serviceName: serviceName,
                    details: service.details || "",
                    pricingType: service.pricingType,
                    price: service.price,
                    isActive: service.isActive,
                    estimatedDuration: service.estimatedDuration,
                    portfolioImages: service.portfolioImages || [],
                };
            })
        );

        // Build clean response
        const workerData = {
            _id: worker._id,
            name: worker.name,
            phone: worker.phone,
            email: worker.email,
            address: worker.address,
            status: worker.status || "pending",
            rating: worker.rating || 0,
            completedJobs: worker.completedJobs || 0,
            earnings: worker.earnings || 0,
            createdAt: worker.createdAt,
            workerProfile: {
                verification: worker.workerProfile.verification,
                workType: worker.workerProfile?.workType || null,
                availabilityStatus:
                    worker.workerProfile?.availabilityStatus || "available",
                bankDetails: worker.workerProfile?.bankDetails || null,
                skills: (worker.workerProfile?.skills || []).map((s) => ({
                    _id: s.skillId._id,
                    name: s.skillId.name,
                })),
                services: servicesWithNames,
            },
        };

        return successResponse(
            res,
            200,
            "Worker details fetched successfully",
            workerData
        );
    } catch (error) {
        console.error("Error in getWorkerDetails:", error);
        return errorResponse(res, 500, "Server error. Please try again later.");
    }
};
/* ----------------------- 🧩 3. APPROVE WORKER VERIFICATION ----------------------- */
export const approveWorkerVerification = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await User.findOne({ _id: workerId, role: "WORKER" });
        if (!worker) return errorResponse(res, 404, "Worker not found");

        if (req.user.role === "SERVICE_AGENT") {
            const serviceAgent = await ServiceAgent.findOne({
                user: req.user._id,
            });
            if (serviceAgent && worker.address?.area !== serviceAgent.area) {
                return errorResponse(res, 403, "Not authorized for this area");
            }
        }

        worker.workerProfile.verification.status = "APPROVED";
        worker.workerProfile.verification.verifiedBy = req.user._id;
        worker.workerProfile.verification.verifiedAt = new Date();
        worker.workerProfile.availabilityStatus = "available";

        await worker.save();

        return successResponse(res, 200, "Worker approved successfully", {
            worker,
        });
    } catch (error) {
        console.error("Approve error:", error);
        return errorResponse(res, 500, "Failed to approve worker");
    }
};

/* ----------------------- 🧩 4. REJECT WORKER VERIFICATION ----------------------- */
export const rejectWorkerVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { reason } = req.body;

        const worker = await User.findOne({ _id: workerId, role: "WORKER" });
        if (!worker) return errorResponse(res, 404, "Worker not found");

        worker.workerProfile.verification.status = "REJECTED";
        worker.workerProfile.verification.rejectionReason =
            reason || "Verification rejected";
        worker.workerProfile.availabilityStatus = "off-duty";

        await worker.save();

        return successResponse(res, 200, "Worker rejected successfully", {
            worker,
        });
    } catch (error) {
        console.error("Reject error:", error);
        return errorResponse(res, 500, "Failed to reject worker");
    }
};

/* ----------------------- 🧩 5. VIEW WORKER DOCUMENTS ----------------------- */
export const viewWorkerDocuments = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await User.findById(workerId)
            .select("workerProfile.verification")
            .lean();

        if (!worker) return errorResponse(res, 404, "Worker not found");

        return successResponse(
            res,
            200,
            "Worker documents fetched successfully",
            {
                documents: worker.workerProfile?.verification || {},
            }
        );
    } catch (error) {
        console.error("Error fetching documents:", error);
        return errorResponse(res, 500, "Failed to fetch documents");
    }
};

/* ----------------------- 🧩 6. APPROVE / REJECT DOCUMENTS ----------------------- */
export const verifyDocument = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { docType, action } = req.body; // action = "APPROVE" | "REJECT"

        const worker = await User.findOne({ _id: workerId, role: "WORKER" });
        if (!worker) return errorResponse(res, 404, "Worker not found");

        const docFieldMap = {
            selfie: "isSelfieVerified",
            aadhaar: "isAddharDocVerified",
            police: "isPoliceVerificationDocVerified",
        };

        const field = docFieldMap[docType];
        if (!field) return errorResponse(res, 400, "Invalid document type");

        worker.workerProfile.verification[field] = action === "APPROVE";

        if (action === "REJECT") {
            worker.workerProfile.verification.status = "REJECTED";
        }

        await worker.save();

        return successResponse(res, 200, `Document ${action.toLowerCase()}ed`, {
            worker,
        });
    } catch (error) {
        console.error("Error verifying document:", error);
        return errorResponse(res, 500, "Failed to verify document");
    }
};

export const suspendWorker = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { reason } = req.body;

        const worker = await User.findOne({ _id: workerId, role: "WORKER" });
        if (!worker) return errorResponse(res, 404, "Worker not found");

        // Suspend worker
        worker.workerProfile.availabilityStatus = "off-duty";
        worker.workerProfile.isSuspended = true;
        worker.workerProfile.suspensionReason = reason || "Suspended by admin";
        worker.workerProfile.suspendedAt = new Date();

        await worker.save();

        return successResponse(res, 200, "Worker suspended successfully", {
            workerId: worker._id,
            name: worker.name,
            isSuspended: worker.workerProfile.isSuspended,
            reason: worker.workerProfile.suspensionReason,
        });
    } catch (error) {
        console.error("Error suspending worker:", error);
        return errorResponse(res, 500, "Failed to suspend worker");
    }
};

/* ----------------------- 🧩 8. ACTIVATE WORKER ----------------------- */
export const activateWorker = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await User.findOne({ _id: workerId, role: "WORKER" });
        if (!worker) return errorResponse(res, 404, "Worker not found");

        if (worker.workerProfile?.verification?.status !== "APPROVED") {
            return errorResponse(res, 400, "Cannot activate unverified worker");
        }

        // Activate worker
        worker.workerProfile.availabilityStatus = "available";
        worker.workerProfile.isSuspended = false;
        worker.workerProfile.suspensionReason = undefined;
        worker.workerProfile.suspendedAt = undefined;

        await worker.save();

        return successResponse(res, 200, "Worker activated successfully", {
            workerId: worker._id,
            name: worker.name,
            isSuspended: worker.workerProfile.isSuspended,
        });
    } catch (error) {
        console.error("Error activating worker:", error);
        return errorResponse(res, 500, "Failed to activate worker");
    }
};

export const updatePersonal = async (req, res) => {
    const { name, phone, email, workType } = req.body;
    const worker = await User.findById(req.params.id);

    if (!worker || worker.role !== "WORKER") {
        return res
            .status(404)
            .json({ success: false, message: "Worker not found" });
    }

    worker.name = name?.trim() || worker.name;
    worker.phone = phone?.trim() || worker.phone;
    worker.email = email?.trim() || worker.email;
    if (!worker.workerProfile) worker.workerProfile = {};
    worker.workerProfile.workType = workType || worker.workerProfile.workType;

    await worker.save();
    res.json({
        success: true,
        message: "Personal details updated",
        data: worker,
    });
};

export const updateAddress = async (req, res) => {
    const address = req.body;
    const worker = await User.findById(req.params.id);

    if (!worker || worker.role !== "WORKER") {
        return res
            .status(404)
            .json({ success: false, message: "Worker not found" });
    }

    worker.address = { ...worker.address, ...address };
    await worker.save();

    res.json({
        success: true,
        message: "Address updated",
        data: worker.address,
    });
};

export const updateBank = async (req, res) => {
    const bankDetails = req.body;
    const worker = await User.findById(req.params.id);

    if (!worker || worker.role !== "WORKER") {
        return res
            .status(404)
            .json({ success: false, message: "Worker not found" });
    }

    if (!worker.workerProfile) worker.workerProfile = {};
    worker.workerProfile.bankDetails = {
        ...worker.workerProfile.bankDetails,
        ...bankDetails,
    };

    await worker.save();
    res.json({
        success: true,
        message: "Bank details updated",
        data: worker.workerProfile.bankDetails,
    });
};

// controllers/skillServiceController.js
export const updateSkillsAndServices = async (req, res) => {
    const { skills, services } = req.body;
    const workerId = req.params.id;

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "WORKER") {
        return res
            .status(404)
            .json({ success: false, message: "Worker not found" });
    }

    if (!worker.workerProfile) worker.workerProfile = {};

    // 1. Update skills (for display)
    worker.workerProfile.skills = skills.map((id) => ({ skillId: id }));

    // 2. Delete old WorkerService
    await WorkerService.deleteMany({ workerId });

    let insertedServices = [];
    if (services?.length) {
        const newServices = services.map((s) => ({
            workerId,
            skillId: s.skillId,
            serviceId: s.serviceId,
            details: s.details,
            pricingType: s.pricingType,
            price: parseFloat(s.price) || 0,
            estimatedDuration: 1,
        }));

        insertedServices = await WorkerService.insertMany(newServices);
    }

    // CRITICAL: Save WorkerService _id into workerProfile.services
    worker.workerProfile.services = insertedServices.map((s) => s._id);

    await worker.save();

    // 4. Return populated data
    const updated = await User.findById(workerId)
        .populate("workerProfile.skills.skillId", "name")
        .populate({
            path: "workerProfile.services",
            populate: [
                { path: "skillId", select: "name" },
                { path: "serviceId", select: "name" },
            ],
        });

    res.json({
        success: true,
        message: "Skills & services updated",
        data: updated.workerProfile,
    });
};
export const getSkills = async (req, res) => {
    const skills = await Skill.find()
        .select("name")
        .populate("services", "name serviceId");

    res.json({ success: true, data: skills });
};
