import User from "../models/user.model.js";
import { deleteFromCloudinary, extractPublicId } from "../config/cloudinary.js";
import { errorResponse, successResponse } from "../utils/response.js";
import {cloudinary } from "../config/cloudinary.js";
import  { WorkerService} from "../models/workerService.model.js";

export const createWorker = async (req, res) => {
  try {
    const { name, phone,email , address, password } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required",
      });
    }

    // Check for duplicate worker (based on phone)
    const existingWorker = await User.findOne({ phone, role: "WORKER" });
    if (existingWorker) {
      return res.status(409).json({
        success: false,
        message: "A worker with this phone number already exists",
      });
    }

    // Prepare worker document URLs (uploaded to Cloudinary)
    let uploadedDocuments = [];
    if (req.files && req.files.length > 0) {
      uploadedDocuments = req.files.map((file) => ({
        name: file.originalname,
        url: file.path, // Cloudinary returns URL in 'path'
      }));
    }

    // Generate random password if not provided
    const passwordToSet = password || Math.random().toString(36).slice(-8);

    // Create worker
    const newWorker = new User({
      name,
      phone,
      email: email || `worker_${phone}@nosmartphone.com`,

      password: passwordToSet,
      role: "WORKER",
      address: {
        houseNo: address?.houseNo || "",
        street: address?.street || "",
        area: address?.area || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.pincode || "",
      },
      workerProfile: {
        createdByAgent: true,
        createdBy: req.user?._id || null,
        documents: uploadedDocuments,
      },
    });

    await newWorker.save();

    // Success Response
    return res.status(201).json({
      success: true,
      message: "Worker created successfully",
      data: {
        workerId: newWorker._id,
        name: newWorker.name,
        phone: newWorker.phone,
        password: passwordToSet, // You can choose to hide this
        createdBy: newWorker.workerProfile.createdBy,
        documents: newWorker.workerProfile.documents,
      },
    });
  } catch (error) {
    console.error("Create Worker Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create worker",
      error: error.message,
    });
  }
}
export const uploadAllDocuments = async (req, res) => {
  try {
    const { workerId } = req.params;

    if (!req.files || Object.keys(req.files).length === 0) {
      return errorResponse(res, 400, "At least one document is required");
    }

    const user = await User.findById(workerId);

    if (!user) {
      return errorResponse(res, 403, "Worker not found");
    }

    // Initialize workerProfile and verification if not exists
    if (!user.workerProfile) user.workerProfile = {};
    if (!user.workerProfile.verification) user.workerProfile.verification = {};

    const uploadedDocs = {};

    // Helper function to upload to Cloudinary
    const uploadToCloudinary = async (file, folder) => {
      const result = await cloudinary.uploader.upload(file.path, { folder });
      return result.secure_url;
    };

    // Upload selfie
    if (req.files.selfie && req.files.selfie[0]) {
      if (user.workerProfile.verification.selfieUrl) {
        const oldPublicId = extractPublicId(user.workerProfile.verification.selfieUrl);
        if (oldPublicId) await deleteFromCloudinary(oldPublicId);
      }
      user.workerProfile.verification.selfieUrl = await uploadToCloudinary(
        req.files.selfie[0],
        "workers/selfies"
      );
      user.workerProfile.verification.isSelfieVerified = false;
      uploadedDocs.selfie = user.workerProfile.verification.selfieUrl;
    }

    // Upload Aadhaar
    if (req.files.aadhar && req.files.aadhar[0]) {
      if (user.workerProfile.verification.addharDocUrl) {
        const oldPublicId = extractPublicId(user.workerProfile.verification.addharDocUrl);
        if (oldPublicId) await deleteFromCloudinary(oldPublicId);
      }
      user.workerProfile.verification.addharDocUrl = await uploadToCloudinary(
        req.files.aadhar[0],
        "workers/aadhaar"
      );
      user.workerProfile.verification.isAddharDocVerified = false;
      uploadedDocs.aadhar = user.workerProfile.verification.addharDocUrl;
    }

    // Upload police verification
    if (req.files.policeVerification && req.files.policeVerification[0]) {
      if (user.workerProfile.verification.policeVerificationDocUrl) {
        const oldPublicId = extractPublicId(
          user.workerProfile.verification.policeVerificationDocUrl
        );
        if (oldPublicId) await deleteFromCloudinary(oldPublicId);
      }
      user.workerProfile.verification.policeVerificationDocUrl = await uploadToCloudinary(
        req.files.policeVerification[0],
        "workers/police_verification"
      );
      user.workerProfile.verification.isPoliceVerificationDocVerified = false;
      uploadedDocs.policeVerification = user.workerProfile.verification.policeVerificationDocUrl;
    }

    // Set verification status to PENDING
    user.workerProfile.verification.status = "PENDING";

    await user.save();

    return successResponse(res, 200, "Documents uploaded successfully", {
      workerId: user._id,
      uploadedDocuments: uploadedDocs,
      verificationStatus: "PENDING",
      message: "Your documents have been uploaded and are pending verification",
    });
  } catch (error) {
    console.error("Upload all documents error:", error);
    return errorResponse(res, 500, "Failed to upload documents");
  }
};
export const addBankDetails = async (req, res) => {
  try {
    const workerId = req.params.workerId;
    const { accountHolderName, accountNumber, ifscCode, bankName, branchName } = req.body;

    const user = await User.findById(workerId);
    if (!user || user.role !== "WORKER") {
      return res.status(404).json({ message: "Worker not found" });
    }

    user.bankDetails = { accountHolderName, accountNumber, ifscCode, bankName, branchName };
    await user.save();

    res.status(200).json({ message: "Bank details added successfully", bankDetails: user.bankDetails });
  } catch (error) {
    console.error("Error adding bank details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const addSkillAndService = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { services, workType, dailyAvailability } = req.body;

    // 🔍 Validate input
    if (!workerId) {
      return errorResponse(res, 400, "Worker ID is required");
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return errorResponse(res, 400, "Services array is required");
    }

    // 🧾 Find the worker
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "WORKER") {
      return errorResponse(res, 404, "Worker not found or invalid role");
    }

    const results = [];
    const errors = [];

    // Process each service
    for (const serviceData of services) {
      const { skillId, serviceId, details, pricingType, price } = serviceData;

      // Validate individual service data
      if (!skillId || !serviceId) {
        errors.push(`Missing skillId or serviceId for service: ${JSON.stringify(serviceData)}`);
        continue;
      }

      try {
        // 🧩 Check if this skill-service combination already exists for this worker
        const existing = await WorkerService.findOne({
          workerId,
          skillId,
          serviceId,
        });
        
        if (existing) {
          errors.push(`Skill ${skillId} and service ${serviceId} already added for this worker`);
          continue;
        }

        // 💼 Create new WorkerService entry
        const newWorkerService = new WorkerService({
          workerId,
          skillId,
          serviceId,
          details: details?.trim() || "",
          pricingType: pricingType || "FIXED",
          price: price || 0,
          portfolioImages: [],
        });

        await newWorkerService.save();
        results.push(newWorkerService);

      } catch (error) {
        errors.push(`Error adding service ${serviceId}: ${error.message}`);
      }
    }

    // Update worker's work type and availability if provided
    if (workType || dailyAvailability) {
      const updateData = {};
      if (workType) updateData.workType = workType;
      if (dailyAvailability) updateData.dailyAvailability = dailyAvailability;
      
      await User.findByIdAndUpdate(workerId, updateData);
    }

    // ✅ Success with warnings if any errors occurred
    if (errors.length > 0) {
      return successResponse(res, 207, "Some services were added successfully with warnings", {
        addedServices: results,
        errors: errors
      });
    }

    return successResponse(res, 201, "All skills and services added successfully", results);
    
  } catch (error) {
    console.error("Error adding skill and service:", error);
    return errorResponse(res, 500, "Internal server error", error.message);
  }
};
export const addOrUpdateBankDetails = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { accountNumber, accountHolderName, IFSCCode, bankName } = req.body;

    // Validation
    if (!accountNumber || !accountHolderName || !IFSCCode || !bankName) {
      return errorResponse(res, 400, "All bank details fields are required");
    }

    // Fetch worker
    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "WORKER") {
      return errorResponse(res, 404, "Worker not found");
    }

    // Update nested workerProfile.bankDetails
    worker.workerProfile = worker.workerProfile || {};
    worker.workerProfile.bankDetails = {
      accountNumber,
      accountHolderName,
      IFSCCode,
      bankName,
    };

    await worker.save();

    return successResponse(
      res,
      200,
      "Bank details added/updated successfully",
      worker.workerProfile.bankDetails
    );
  } catch (error) {
    console.error("Error updating bank details:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

/**
 * @route   GET /api/workers/:workerId/bank-details
 * @desc    Get worker bank details
 * @access  Private (Admin or Worker)
 */
export const getBankDetails = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "WORKER") {
      return errorResponse(res, 404, "Worker not found");
    }

    return successResponse(
      res,
      200,
      "Bank details fetched successfully",
      worker.workerProfile?.bankDetails || {}
    );
  } catch (error) {
    console.error("Error fetching bank details:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

// controllers/workerController.js
export const updateWorkerSkillsAndAvailability = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { skills, dailyAvailability } = req.body;

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'WORKER') {
      return errorResponse(res, 404, 'Worker not found');
    }

    worker.workerProfile.skills = skills;
    worker.workerProfile.dailyAvailability = dailyAvailability;
    await worker.save();

    return successResponse(res, 200, 'Skills and availability updated successfully', {
      skills: worker.workerProfile.skills,
      dailyAvailability: worker.workerProfile.dailyAvailability,
    });
  } catch (error) {
    console.error('Error updating skills and availability:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};
export const getAgentWorkers = async (req, res) => {
  const workers = await User.find({
    role: "WORKER",
    "workerProfile.createdByAgent": true,
  })
    .select("name phone address workerProfile.availabilityStatus")
    .populate("workerProfile.skills.skillId", "name")
    .populate({
      path: "workerProfile.services",
      populate: [
        { path: "skillId", select: "name" },
        { path: "serviceId", select: "name" },
      ],
    });

  res.json({ success: true, data: workers });
};
export const updateAvailability =async (req, res) => {
  const { availabilityStatus } = req.body;
  const { id } = req.params;

  // VALIDATE AGAINST YOUR ENUM
  const validStatuses = ["available", "busy", "off-duty"];
  if (!validStatuses.includes(availabilityStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be: ${validStatuses.join(", ")}`,
    });
  }

  const worker = await User.findById(id);
  if (!worker || worker.role !== "WORKER") {
    return res.status(404).json({ success: false, message: "Worker not found" });
  }

  if (!worker.workerProfile) worker.workerProfile = {};
  worker.workerProfile.availabilityStatus = availabilityStatus;

  await worker.save();

  res.json({
    success: true,
    message: "Availability updated",
    data: { availabilityStatus: worker.workerProfile.availabilityStatus },
  });
};