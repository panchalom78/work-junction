import mongoose from "mongoose";
import User from "../models/user.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import ServiceAgent from "../models/serviceAgent.model.js";
import { Skill } from "../models/skill.model.js";

/* ------------------------- 🧩 1. GET ALL WORKERS ------------------------- */
export const getAllWorkers = async (req, res) => {
  try {
    const serviceAgentId = req.user._id;
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {
      role: "WORKER",
      "workerProfile.createdBy": serviceAgentId,
    };

    // 🔍 Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.area": { $regex: search, $options: "i" } },
      ];
    }

    // 🔘 Status filter
    if (status && status !== "all") {
      if (status === "active") {
        query["workerProfile.verification.status"] = "APPROVED";
        query["workerProfile.availabilityStatus"] = "available";
      } else if (status === "suspended") {
        query.$or = [
          { "workerProfile.availabilityStatus": "off-duty" },
          { "workerProfile.verification.status": "REJECTED" },
        ];
      } else if (status === "pending") {
        query["workerProfile.verification.status"] = "PENDING";
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const workers = await User.find(query)
      .select("-password -otp")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const workerIds = workers.map((w) => w._id);
    const workerServices = await WorkerService.find({
      workerId: { $in: workerIds },
    })
      .populate("skillId", "name")
      .populate("serviceId", "name");

    const formattedWorkers = workers.map((worker) => {
      const services = workerServices.filter((ws) =>
        ws.workerId.equals(worker._id)
      );

      let status = "pending";
      if (worker.workerProfile?.verification?.status === "APPROVED") {
        status =
          worker.workerProfile.availabilityStatus === "available"
            ? "active"
            : "suspended";
      } else if (worker.workerProfile?.verification?.status === "REJECTED") {
        status = "rejected";
      }

      return {
        ...worker,
        status,
        serviceCount: services.length,
        services,
      };
    });

    const totalWorkers = await User.countDocuments(query);

    return successResponse(res, 200, "Workers fetched successfully", {
      workers: formattedWorkers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalWorkers / parseInt(limit)),
        totalWorkers,
      },
    });
  } catch (error) {
    console.error("Error fetching workers:", error);
    return errorResponse(res, 500, "Failed to fetch workers");
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

    // Fetch worker with FULLY populated skills & services
    const worker = await User.findById(workerId)
      .select("-password -otp") // Exclude sensitive fields
      .populate({
        path: "workerProfile.skills.skillId",
        select: "name",
      })
      .populate({
        path: "workerProfile.services",
        populate: [
          { path: "skillId", select: "name" },
          { path: "serviceId", select: "name" },
        ],
      });

    if (!worker || worker.role !== "WORKER") {
      return errorResponse(res, 404, "Worker not found");
    }

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
        workType: worker.workerProfile?.workType || null,
        availabilityStatus: worker.workerProfile?.availabilityStatus || "available",
        bankDetails: worker.workerProfile?.bankDetails || null,
        skills: (worker.workerProfile?.skills || []).map(s => ({
          _id: s.skillId._id,
          name: s.skillId.name,
        })),
        services: (worker.workerProfile?.services || []).map(s => ({
          _id: s._id,
          skillId: { _id: s.skillId._id, name: s.skillId.name },
          serviceId: { _id: s.serviceId._id, name: s.serviceId.name },
          details: s.details || "",
          pricingType: s.pricingType,
          price: s.price,
          isActive: s.isActive,
        })),
      },
    };

    return successResponse(res, 200, "Worker details fetched successfully", workerData);
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
      const serviceAgent = await ServiceAgent.findOne({ user: req.user._id });
      if (serviceAgent && worker.address?.area !== serviceAgent.area) {
        return errorResponse(res, 403, "Not authorized for this area");
      }
    }

    worker.workerProfile.verification.status = "APPROVED";
    worker.workerProfile.verification.verifiedBy = req.user._id;
    worker.workerProfile.verification.verifiedAt = new Date();
    worker.workerProfile.availabilityStatus = "available";

    await worker.save();

    return successResponse(res, 200, "Worker approved successfully", { worker });
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

    return successResponse(res, 200, "Worker rejected successfully", { worker });
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

    return successResponse(res, 200, "Worker documents fetched successfully", {
      documents: worker.workerProfile?.verification || {},
    });
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
    return res.status(404).json({ success: false, message: "Worker not found" });
  }

  worker.name = name?.trim() || worker.name;
  worker.phone = phone?.trim() || worker.phone;
  worker.email = email?.trim() || worker.email;
  if (!worker.workerProfile) worker.workerProfile = {};
  worker.workerProfile.workType = workType || worker.workerProfile.workType;

  await worker.save();
  res.json({ success: true, message: "Personal details updated", data: worker });
};

export const updateAddress = async (req, res) => {
  const address = req.body;
  const worker = await User.findById(req.params.id);

  if (!worker || worker.role !== "WORKER") {
    return res.status(404).json({ success: false, message: "Worker not found" });
  }

  worker.address = { ...worker.address, ...address };
  await worker.save();

  res.json({ success: true, message: "Address updated", data: worker.address });
};

export const updateBank =async (req, res) => {
  const bankDetails = req.body;
  const worker = await User.findById(req.params.id);

  if (!worker || worker.role !== "WORKER") {
    return res.status(404).json({ success: false, message: "Worker not found" });
  }

  if (!worker.workerProfile) worker.workerProfile = {};
  worker.workerProfile.bankDetails = { ...worker.workerProfile.bankDetails, ...bankDetails };

  await worker.save();
  res.json({ success: true, message: "Bank details updated", data: worker.workerProfile.bankDetails });
};

// controllers/skillServiceController.js
export const updateSkillsAndServices = async (req, res) => {
  const { skills, services } = req.body;
  const workerId = req.params.id;

  const worker = await User.findById(workerId);
  if (!worker || worker.role !== "WORKER") {
    return res.status(404).json({ success: false, message: "Worker not found" });
  }

  if (!worker.workerProfile) worker.workerProfile = {};

  // 1. Update skills (for display)
  worker.workerProfile.skills = skills.map(id => ({ skillId: id }));

  // 2. Delete old WorkerService
  await WorkerService.deleteMany({ workerId });

  let insertedServices = [];
  if (services?.length) {
    const newServices = services.map(s => ({
      workerId,
      skillId: s.skillId,
      serviceId: s.serviceId,
      details: s.details,
      pricingType: s.pricingType,
      price: parseFloat(s.price) || 0,
    }));

    insertedServices = await WorkerService.insertMany(newServices);
  }

  // CRITICAL: Save WorkerService _id into workerProfile.services
  worker.workerProfile.services = insertedServices.map(s => s._id);

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

  res.json({ success: true, message: "Skills & services updated", data: updated.workerProfile });
};
export const getSkills = async (req, res) => {
  const skills = await Skill.find()
    .select("name")
    .populate("services", "name serviceId");

  res.json({ success: true, data: skills });
};  