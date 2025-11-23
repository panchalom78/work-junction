import User from "../models/user.model.js";
import { deleteFromCloudinary, extractPublicId } from "../config/cloudinary.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { cloudinary } from "../config/cloudinary.js";
import { WorkerService } from "../models/workerService.model.js";
import { Booking } from "../models/booking.model.js";
import mongoose from "mongoose";
import { Skill } from "../models/skill.model.js";
export const createWorker = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            password,
            address,
            workType,
            selectedSkills = [],
            selectedServices = [], // This should contain service IDs
            bankDetails = {},
        } = req.body;

        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone number are required",
            });
        }

        // Check for duplicate worker
        const existingWorker = await User.findOne({ phone, role: "WORKER" });
        if (existingWorker) {
            return res.status(409).json({
                success: false,
                message: "A worker with this phone number already exists",
            });
        }

        // Generate random password if not provided
        const passwordToSet = password || Math.random().toString(36).slice(-8);

        /* ------------------- Document Upload (optional) ------------------- */
        let selfieUrl = null,
            aadharUrl = null,
            policeUrl = null;

        if (req.files) {
            selfieUrl = req.files?.["selfie"]?.[0]?.path || null;
            aadharUrl = req.files?.["aadhar"]?.[0]?.path || null;
            policeUrl = req.files?.["policeVerification"]?.[0]?.path || null;
        }

        /* ------------------- Create Worker Document ------------------- */
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
                skills: Array.isArray(selectedSkills)
                    ? selectedSkills.map((skillId) => ({ skillId }))
                    : [],
                services: Array.isArray(selectedServices)
                    ? selectedServices
                    : [],
                verification: {
                    status: "APPROVED", // ✅ Set to APPROVED
                    serviceAgentId: req.user?._id || null, // ✅ Add serviceAgentId
                    selfieUrl: selfieUrl, // ✅ Correct field name
                    addharDocUrl: aadharUrl, // ✅ Correct field name
                    policeVerificationDocUrl: policeUrl, // ✅ Correct field name
                    isSelfieVerified: true, // ✅ Set to true
                    isAddharDocVerified: true, // ✅ Set to true
                    isPoliceVerificationDocVerified: true, // ✅ Set to true
                    verifiedAt: new Date(), // ✅ Add verification timestamp
                },
                bankDetails: {
                    accountNumber: bankDetails?.accountNumber || "",
                    accountHolderName: bankDetails?.accountHolderName || "",
                    IFSCCode: bankDetails?.IFSCCode || "",
                    bankName: bankDetails?.bankName || "",
                },
            },
        });

        await newWorker.save();

        /* ------------------- Create WorkerService entries ------------------- */
        if (Array.isArray(selectedServices) && selectedServices.length > 0) {
            const workerServicePromises = selectedServices.map(
                async (serviceId) => {
                    try {
                        return await WorkerService.create({
                            worker: newWorker._id,
                            service: serviceId,
                        });
                    } catch (error) {
                        console.error(
                            `Error creating WorkerService for service ${serviceId}:`,
                            error
                        );
                        return null;
                    }
                }
            );

            const workerServices = await Promise.all(workerServicePromises);
            const validWorkerServices = workerServices.filter(
                (ws) => ws !== null
            );

            // Update worker with WorkerService IDs
            if (validWorkerServices.length > 0) {
                await User.findByIdAndUpdate(newWorker._id, {
                    $set: {
                        "workerProfile.services": validWorkerServices.map(
                            (ws) => ws._id
                        ),
                    },
                });
            }
        }

        /* ------------------- Success Response ------------------- */
        return res.status(201).json({
            success: true,
            message: "Worker created successfully (auto-approved by agent)",
            data: {
                workerId: newWorker._id,
                name: newWorker.name,
                phone: newWorker.phone,
                password: passwordToSet,
                createdBy: newWorker.workerProfile.createdBy,
                verification: newWorker.workerProfile.verification,
                bankDetails: newWorker.workerProfile.bankDetails,
                skills: newWorker.workerProfile.skills,
                services: newWorker.workerProfile.services,
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
};
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
        if (!user.workerProfile.verification)
            user.workerProfile.verification = {};

        const uploadedDocs = {};

        // Helper function to upload to Cloudinary
        const uploadToCloudinary = async (file, folder) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder,
            });
            return result.secure_url;
        };

        // Upload selfie
        if (req.files.selfie && req.files.selfie[0]) {
            if (user.workerProfile.verification.selfieUrl) {
                const oldPublicId = extractPublicId(
                    user.workerProfile.verification.selfieUrl
                );
                if (oldPublicId) await deleteFromCloudinary(oldPublicId);
            }
            user.workerProfile.verification.selfieUrl =
                await uploadToCloudinary(
                    req.files.selfie[0],
                    "workers/selfies"
                );
            user.workerProfile.verification.isSelfieVerified = false;
            uploadedDocs.selfie = user.workerProfile.verification.selfieUrl;
        }

        // Upload Aadhaar
        if (req.files.aadhar && req.files.aadhar[0]) {
            if (user.workerProfile.verification.addharDocUrl) {
                const oldPublicId = extractPublicId(
                    user.workerProfile.verification.addharDocUrl
                );
                if (oldPublicId) await deleteFromCloudinary(oldPublicId);
            }
            user.workerProfile.verification.addharDocUrl =
                await uploadToCloudinary(
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
            user.workerProfile.verification.policeVerificationDocUrl =
                await uploadToCloudinary(
                    req.files.policeVerification[0],
                    "workers/police_verification"
                );
            user.workerProfile.verification.isPoliceVerificationDocVerified = false;
            uploadedDocs.policeVerification =
                user.workerProfile.verification.policeVerificationDocUrl;
        }

        // Set verification status to PENDING
        user.workerProfile.verification.status = "APPROVED";
        user.workerProfile.verification.isSelfieVerified = true;
        user.workerProfile.verification.isAddharDocVerified = true;
        user.workerProfile.verification.isPoliceVerificationDocVerified = true;
        user.workerProfile.verification.verifiedAt = new Date();

        await user.save();

        return successResponse(res, 200, "Documents uploaded successfully", {
            workerId: user._id,
            uploadedDocuments: uploadedDocs,
            verificationStatus: "APPROVED",
            message:
                "Your documents have been uploaded and are pending verification",
        });
    } catch (error) {
        console.error("Upload all documents error:", error);
        return errorResponse(res, 500, "Failed to upload documents");
    }
};
export const addBankDetails = async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const {
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
            branchName,
        } = req.body;

        const user = await User.findById(workerId);
        if (!user || user.role !== "WORKER") {
            return res.status(404).json({ message: "Worker not found" });
        }

        user.bankDetails = {
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
            branchName,
        };
        await user.save();

        res.status(200).json({
            message: "Bank details added successfully",
            bankDetails: user.bankDetails,
        });
    } catch (error) {
        console.error("Error adding bank details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export const addSkillsAndServices = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { services } = req.body;

        console.log("Received services data:", services);
        console.log("Worker ID:", workerId);

        // Validate worker exists
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

        // Validate services data
        if (!services || !Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Services data is required and must be a non-empty array",
            });
        }

        // Extract unique skillIds from services for worker profile
        const skillIds = [
            ...new Set(services.map((service) => service.skillId)),
        ];

        // Update worker skills in profile
        await User.findByIdAndUpdate(workerId, {
            $set: {
                "workerProfile.skills": skillIds.map((skillId) => ({
                    skillId,
                })),
            },
        });

        // Deactivate existing services
        await WorkerService.updateMany(
            { workerId, isActive: true },
            { isActive: false }
        );

        // Create new worker services
        const createdServices = await WorkerService.insertMany(
            services.map((service) => ({
                workerId,
                skillId: service.skillId,
                serviceId: service.serviceId,
                details: service.details || "",
                pricingType: service.pricingType || "FIXED",
                price: service.price || 0,
                isActive: true,
            }))
        );

        // Update worker profile with new services
        await User.findByIdAndUpdate(workerId, {
            $set: {
                "workerProfile.services": createdServices.map(
                    (service) => service._id
                ),
            },
        });

        // Get updated worker data without population (since we don't have separate Service model)
        const updatedWorker = await User.findById(workerId)
            .select("-password")
            .lean();

        // Get worker services
        const workerServices = await WorkerService.find({
            workerId,
            isActive: true,
        }).lean();

        res.status(200).json({
            success: true,
            message: "Skills and services added successfully",
            data: {
                worker: updatedWorker,
                services: workerServices,
            },
        });
    } catch (error) {
        console.error("Add skills and services error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add skills and services",
            error: error.message,
        });
    }
};
export const addOrUpdateBankDetails = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { accountNumber, accountHolderName, IFSCCode, bankName } =
            req.body;

        // Validation
        if (!accountNumber || !accountHolderName || !IFSCCode || !bankName) {
            return errorResponse(
                res,
                400,
                "All bank details fields are required"
            );
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
        if (!worker || worker.role !== "WORKER") {
            return errorResponse(res, 404, "Worker not found");
        }

        worker.workerProfile.skills = skills;
        worker.workerProfile.dailyAvailability = dailyAvailability;
        await worker.save();

        return successResponse(
            res,
            200,
            "Skills and availability updated successfully",
            {
                skills: worker.workerProfile.skills,
                dailyAvailability: worker.workerProfile.dailyAvailability,
            }
        );
    } catch (error) {
        console.error("Error updating skills and availability:", error);
        return errorResponse(res, 500, "Internal server error");
    }
};
export const getAgentWorkers = async (req, res) => {
  try {
    const agentId = req.user?._id;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "Agent authentication required",
      });
    }

    const workers = await User.find({
      role: "WORKER",
      "workerProfile.createdByAgent": true,
      "workerProfile.createdBy": agentId,  // ✔ Fetch only this agent’s workers
    })
      .select("name phone address workerProfile.availabilityStatus workerProfile.skills workerProfile.services workerProfile.verification")
      .populate("workerProfile.skills.skillId", "name")
      .populate({
        path: "workerProfile.services",
        populate: [
          { path: "skillId", select: "name" },
          { path: "serviceId", select: "name" },
        ],
      });

    return res.json({
      success: true,
      data: workers,
    });

  } catch (error) {
    console.error("Get Agent Workers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workers",
      error: error.message,
    });
  }
};

export const updateAvailability = async (req, res) => {
    try {
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

        // Update using findByIdAndUpdate to avoid full document save issues
        const worker = await User.findOneAndUpdate(
            {
                _id: id,
                role: "WORKER",
            },
            {
                $set: {
                    "workerProfile.availabilityStatus": availabilityStatus,
                },
            },
            {
                new: true, // Return updated document
                runValidators: true,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.json({
            success: true,
            message: "Availability updated",
            data: {
                availabilityStatus: worker.workerProfile.availabilityStatus,
            },
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all bookings for agent-created workers
export const getAgentWorkerBookings = async (req, res) => {
    try {
        const agentId = req.user._id;
        const {
            status,
            page = 1,
            limit = 10,
            workerId,
            startDate,
            endDate,
            search,
        } = req.query;

        // Build query for agent's workers bookings
        const query = {
            workerId: {
                $in: await User.find({
                    "workerProfile.createdBy": agentId,
                    role: "WORKER",
                }).distinct("_id"),
            },
        };

        // Status filter
        if (status && status !== "all") {
            query.status = status.toUpperCase();
        }

        // Worker filter
        if (workerId && mongoose.Types.ObjectId.isValid(workerId)) {
            query.workerId = workerId;
        }

        // Date range filter
        if (startDate || endDate) {
            query.bookingDate = {};
            if (startDate) query.bookingDate.$gte = new Date(startDate);
            if (endDate) query.bookingDate.$lte = new Date(endDate);
        }

        // Search filter (customer name, service, etc.)
        if (search) {
            const customerIds = await User.find({
                name: { $regex: search, $options: "i" },
                role: "CUSTOMER",
            }).distinct("_id");

            query.$or = [
                { customerId: { $in: customerIds } },
                { "payment.transactionId": { $regex: search, $options: "i" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate("customerId", "name phone email")
            .populate("workerId", "name phone workerProfile")
            .populate("workerServiceId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalBookings = await Booking.countDocuments(query);

        // Format response
        const formattedBookings = bookings.map((booking) => ({
            _id: booking._id,
            customer: {
                _id: booking.customerId._id,
                name: booking.customerId.name,
                phone: booking.customerId.phone,
                email: booking.customerId.email,
            },
            worker: {
                _id: booking.workerId._id,
                name: booking.workerId.name,
                phone: booking.workerId.phone,
                availability:
                    booking.workerId.workerProfile?.availabilityStatus,
            },
            serviceDetails: {
                workerServiceId: booking.workerServiceId?._id,
                serviceId: booking.serviceId,
                price: booking.price,
            },
            bookingInfo: {
                date: booking.bookingDate,
                time: booking.bookingTime,
                status: booking.status,
                createdAt: booking.createdAt,
            },
            payment: booking.payment,
            review: booking.review,
            serviceTimeline: {
                initiated: booking.serviceInitiated,
                initiatedAt: booking.serviceInitiatedAt,
                startedAt: booking.serviceStartedAt,
                completedAt: booking.serviceCompletedAt,
            },
            cancellationReason: booking.cancellationReason,
            declineReason: booking.declineReason,
        }));

        res.status(200).json({
            success: true,
            data: formattedBookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalBookings / parseInt(limit)),
                totalBookings,
                limit: parseInt(limit),
            },
            message: "Bookings fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching agent worker bookings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const agentId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            workerId: {
                $in: await User.find({
                    "workerProfile.createdBy": agentId,
                    role: "WORKER",
                }).distinct("_id"),
            },
        })
            .populate("customerId", "name phone email address")
            .populate("workerId", "name phone workerProfile skills")
            .populate({
                path: "workerServiceId",
                populate: {
                    path: "skillId",
                    select: "name",
                },
            })
            .lean();

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or access denied",
            });
        }

        const bookingDetails = {
            _id: booking._id,
            customer: {
                _id: booking.customerId._id,
                name: booking.customerId.name,
                phone: booking.customerId.phone,
                email: booking.customerId.email,
                address: booking.customerId.address,
            },
            worker: {
                _id: booking.workerId._id,
                name: booking.workerId.name,
                phone: booking.workerId.phone,
                availability:
                    booking.workerId.workerProfile?.availabilityStatus,
                skills: booking.workerId.skills,
            },
            service: {
                workerServiceId: booking.workerServiceId?._id,
                serviceId: booking.serviceId,
                skill: booking.workerServiceId?.skillId?.name,
                price: booking.price,
            },
            booking: {
                date: booking.bookingDate,
                time: booking.bookingTime,
                status: booking.status,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
            },
            payment: booking.payment,
            review: booking.review,
            serviceProgress: {
                initiated: booking.serviceInitiated,
                initiatedAt: booking.serviceInitiatedAt,
                otp: booking.serviceOtp ? "****" : null, // Mask OTP for security
                startedAt: booking.serviceStartedAt,
                completedAt: booking.serviceCompletedAt,
            },
            reasons: {
                cancellation: booking.cancellationReason,
                decline: booking.declineReason,
            },
        };

        res.status(200).json({
            success: true,
            data: bookingDetails,
            message: "Booking details fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update booking status (Agent can update status for his workers)
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const agentId = req.user._id;
        const { status, reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const validStatuses = [
            "PENDING",
            "ACCEPTED",
            "DECLINED",
            "COMPLETED",
            "CANCELLED",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        // Check if booking belongs to agent's worker
        const booking = await Booking.findOne({
            _id: bookingId,
            workerId: {
                $in: await User.find({
                    "workerProfile.createdBy": agentId,
                    role: "WORKER",
                }).distinct("_id"),
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or access denied",
            });
        }

        // Status transition validation
        const statusFlow = {
            PENDING: ["ACCEPTED", "DECLINED", "CANCELLED"],
            ACCEPTED: ["COMPLETED", "CANCELLED"],
            DECLINED: [],
            COMPLETED: [],
            CANCELLED: [],
        };

        if (!statusFlow[booking.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${booking.status} to ${status}`,
            });
        }

        // Update booking
        const updateData = { status };

        if (status === "DECLINED" && reason) {
            updateData.declineReason = reason;
        }

        if (status === "CANCELLED" && reason) {
            updateData.cancellationReason = reason;
        }

        if (status === "COMPLETED") {
            updateData.serviceCompletedAt = new Date();
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        )
            .populate("customerId", "name phone")
            .populate("workerId", "name phone");

        // Update worker availability if completed
        if (status === "COMPLETED") {
            await User.findByIdAndUpdate(updatedBooking.workerId, {
                "workerProfile.availabilityStatus": "available",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: updatedBooking._id,
                status: updatedBooking.status,
                customer: updatedBooking.customerId,
                worker: updatedBooking.workerId,
                declineReason: updatedBooking.declineReason,
                cancellationReason: updatedBooking.cancellationReason,
                serviceCompletedAt: updatedBooking.serviceCompletedAt,
            },
            message: `Booking ${status.toLowerCase()} successfully`,
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Generate service OTP (Agent can generate for his workers)
export const generateServiceOTP = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const agentId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        // Check if booking belongs to agent's worker and is accepted
        const booking = await Booking.findOne({
            _id: bookingId,
            status: "ACCEPTED",
            workerId: {
                $in: await User.find({
                    "workerProfile.createdBy": agentId,
                    role: "WORKER",
                }).distinct("_id"),
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or not accepted",
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                serviceOtp: otp,
                serviceOtpExpires: otpExpires,
                serviceInitiated: true,
                serviceInitiatedAt: new Date(),
            },
            { new: true }
        )
            .populate("customerId", "name phone")
            .populate("workerId", "name phone");

        res.status(200).json({
            success: true,
            data: {
                _id: updatedBooking._id,
                otp: otp, // In production, send via SMS/email instead
                expiresAt: otpExpires,
                customer: updatedBooking.customerId,
                worker: updatedBooking.workerId,
            },
            message: "Service OTP generated successfully",
        });
    } catch (error) {
        console.error("Error generating service OTP:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get booking statistics for agent
export const getBookingStatistics = async (req, res) => {
    try {
        const agentId = req.user._id;
        const { period = "month" } = req.query; // day, week, month, year

        // Get agent's workers
        const agentWorkers = await User.find({
            "workerProfile.createdBy": agentId,
            role: "WORKER",
        }).distinct("_id");

        // Date range based on period
        const now = new Date();
        let startDate;

        switch (period) {
            case "day":
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case "week":
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case "month":
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case "year":
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        // Total bookings count by status
        const statusCounts = await Booking.aggregate([
            {
                $match: {
                    workerId: { $in: agentWorkers },
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Revenue calculation
        const revenueStats = await Booking.aggregate([
            {
                $match: {
                    workerId: { $in: agentWorkers },
                    status: "COMPLETED",
                    "payment.status": "COMPLETED",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$price" },
                    totalBookings: { $sum: 1 },
                    averageEarning: { $avg: "$price" },
                },
            },
        ]);

        // Worker performance
        const workerPerformance = await Booking.aggregate([
            {
                $match: {
                    workerId: { $in: agentWorkers },
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: "$workerId",
                    totalBookings: { $sum: 1 },
                    completedBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
                        },
                    },
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "COMPLETED"] },
                                        {
                                            $eq: [
                                                "$payment.status",
                                                "COMPLETED",
                                            ],
                                        },
                                    ],
                                },
                                "$price",
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "worker",
                },
            },
            {
                $unwind: "$worker",
            },
            {
                $project: {
                    workerName: "$worker.name",
                    workerPhone: "$worker.phone",
                    totalBookings: 1,
                    completedBookings: 1,
                    completionRate: {
                        $multiply: [
                            {
                                $divide: [
                                    "$completedBookings",
                                    "$totalBookings",
                                ],
                            },
                            100,
                        ],
                    },
                    totalEarnings: 1,
                },
            },
            {
                $sort: { totalEarnings: -1 },
            },
        ]);

        const statistics = {
            overview: {
                total: statusCounts.reduce((sum, item) => sum + item.count, 0),
                pending:
                    statusCounts.find((item) => item._id === "PENDING")
                        ?.count || 0,
                accepted:
                    statusCounts.find((item) => item._id === "ACCEPTED")
                        ?.count || 0,
                completed:
                    statusCounts.find((item) => item._id === "COMPLETED")
                        ?.count || 0,
                cancelled:
                    statusCounts.find((item) => item._id === "CANCELLED")
                        ?.count || 0,
            },
            revenue: revenueStats[0] || {
                totalRevenue: 0,
                totalBookings: 0,
                averageEarning: 0,
            },
            workerPerformance,
            period: {
                type: period,
                startDate,
                endDate: new Date(),
            },
        };

        res.status(200).json({
            success: true,
            data: statistics,
            message: "Booking statistics fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching booking statistics:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get available workers for a specific service and time
export const getAvailableWorkers = async (req, res) => {
    try {
        const agentId = req.user._id;
        const { serviceId, date, time } = req.query;

        if (!serviceId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Service ID, date, and time are required",
            });
        }

        const bookingDateTime = new Date(`${date}T${time}`);

        // Get agent's workers who have the required service
        const availableWorkers = await User.aggregate([
            {
                $match: {
                    "workerProfile.createdBy": agentId,
                    role: "WORKER",
                    "workerProfile.availabilityStatus": "available",
                },
            },
            {
                $lookup: {
                    from: "workerservices",
                    localField: "_id",
                    foreignField: "workerId",
                    as: "services",
                },
            },
            {
                $unwind: "$services",
            },
            {
                $match: {
                    "services.serviceId": new mongoose.Types.ObjectId(
                        serviceId
                    ),
                    "services.isActive": true,
                },
            },
            {
                $lookup: {
                    from: "bookings",
                    let: { workerId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$workerId", "$$workerId"] },
                                status: { $in: ["ACCEPTED", "PENDING"] },
                                bookingDate: {
                                    $eq: new Date(date),
                                },
                                $or: [
                                    {
                                        $and: [
                                            { bookingTime: { $lte: time } },
                                            {
                                                $expr: {
                                                    $gte: [
                                                        {
                                                            $add: [
                                                                {
                                                                    $toDate: {
                                                                        $concat:
                                                                            [
                                                                                {
                                                                                    $toString:
                                                                                        "$bookingDate",
                                                                                },
                                                                                "T",
                                                                                "$bookingTime",
                                                                            ],
                                                                    },
                                                                },
                                                                2 *
                                                                    60 *
                                                                    60 *
                                                                    1000, // 2 hours buffer
                                                            ],
                                                        },
                                                        bookingDateTime,
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        $and: [
                                            { bookingTime: { $gte: time } },
                                            {
                                                $expr: {
                                                    $lte: [
                                                        {
                                                            $toDate: {
                                                                $concat: [
                                                                    {
                                                                        $toString:
                                                                            "$bookingDate",
                                                                    },
                                                                    "T",
                                                                    "$bookingTime",
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            $add: [
                                                                bookingDateTime,
                                                                2 *
                                                                    60 *
                                                                    60 *
                                                                    1000,
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                    as: "conflictingBookings",
                },
            },
            {
                $match: {
                    "conflictingBookings.0": { $exists: false }, // No conflicting bookings
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phone: 1,
                    "workerProfile.availabilityStatus": 1,
                    serviceDetails: "$services",
                    skills: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: availableWorkers,
            message: "Available workers fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching available workers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
// GET: Fetch all service requests
export const getServiceRequests = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("customerId", "name phone address")
            .populate("workerId", "name phone")
            .populate("serviceId", "name")
            .populate({
                path: "workerServiceId",
                populate: { path: "skillId", select: "name" },
            })
            .sort({ createdAt: -1 });

        const formatted = bookings.map((b) => ({
            _id: b._id,
            status: b.status,
            customer: b.customerId,
            worker: b.workerId,
            serviceDetails: {
                serviceId: b.serviceId,
                skillName: b.workerServiceId?.skillId?.name || "General",
                price: b.price,
            },
            workerServiceId: b.workerServiceId,
            bookingInfo: {
                date: b.bookingDate,
                time: b.bookingTime,
            },
            payment: b.payment,
            review: b.review,
            serviceInitiatedAt: b.serviceInitiatedAt,
            serviceStartedAt: b.serviceStartedAt,
            serviceCompletedAt: b.serviceCompletedAt,
            serviceOtp: b.serviceOtp,
            serviceOtpExpires: b.serviceOtpExpires,
            remarks: b.remarks,
            cancellationReason: b.cancellationReason,
            declineReason: b.declineReason,
            createdAt: b.createdAt,
            assignedAt: b.assignedAt,
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH: Update status
export const updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, remarks } = req.body;

        const booking = await Booking.findById(requestId);
        if (!booking)
            return res
                .status(404)
                .json({ success: false, message: "Booking not found" });

        booking.status = status;
        if (remarks) booking.remarks = remarks;
        if (status === "ACCEPTED") booking.assignedAt = new Date();

        await booking.save();

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        console.log(error);
    }
};

// GET /api/service-agent/bookings/status/PENDING
export const getBookingsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = [
            "PENDING",
            "ACCEPTED",
            "PAYMENT_PENDING",
            "COMPLETED",
            "CANCELLED",
            "DECLINED",
        ];
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid status" });
        }

        const bookings = await Booking.find({ status })
            .populate("customerId", "name phone address")
            .populate("workerId", "name phone")
            .populate("serviceId", "name")
            .populate({
                path: "workerServiceId",
                populate: { path: "skillId", select: "name" },
            })
            .sort({ createdAt: -1 });

        const formatted = bookings.map((b) => ({
            _id: b._id,
            status: b.status,
            customer: b.customerId,
            worker: b.workerId,
            serviceDetails: {
                serviceId: b.serviceId,
                skillName: b.workerServiceId?.skillId?.name || "General",
                price: b.price,
            },
            workerServiceId: b.workerServiceId,
            bookingInfo: { date: b.bookingDate, time: b.bookingTime },
            payment: b.payment,
            review: b.review,
            serviceInitiatedAt: b.serviceInitiatedAt,
            serviceStartedAt: b.serviceStartedAt,
            serviceCompletedAt: b.serviceCompletedAt,
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ONLY createdByAgent: true
const getNonSmartphoneWorkers = async () => {
    return await User.find({
        role: "WORKER",
        "workerProfile.createdByAgent": true,
    }).select("_id");
};

// ✅ Fixed Booking Population & Formatter
const populateBooking = () => ({
    populate: [
        {
            path: "customerId",
            select: "name email phone address role isVerified customerProfile",
        },
        {
            path: "workerId",
            select: "name phone email role isVerified workerProfile",
        },
        {
            path: "workerServiceId",
            model: "WorkerService",
            populate: [
                {
                    path: "skillId",
                    model: "Skill",
                    select: "name services",
                },
            ],
        },
    ],
});

const formatBooking = (b) => {
    const c = b.customerId || {};
    const w = b.workerId || {};
    const skill = b.workerServiceId?.skillId;

    // ✅ Corrected match condition
    const service =
        skill?.services?.find(
            (srv) =>
                srv.serviceId.toString() ===
                b.workerServiceId?.serviceId?.toString()
        ) || {};

    return {
        _id: b._id,
        status: b.status,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,

        customer: {
            _id: c._id,
            name: c.name || "—",
            phone: c.phone || "—",
            email: c.email || "—",
            address: {
                houseNo: c.address?.houseNo || "—",
                street: c.address?.street || "—",
                area: c.address?.area || "—",
                city: c.address?.city || "—",
                state: c.address?.state || "—",
                pincode: c.address?.pincode || "—",
                coordinates: {
                    latitude: c.address?.coordinates?.latitude || "—",
                    longitude: c.address?.coordinates?.longitude || "—",
                },
            },
        },

        worker: w._id
            ? {
                  _id: w._id,
                  name: w.name || "—",
                  phone: w.phone || "—",
                  createdByAgent: w.workerProfile?.createdByAgent || false,
                  bankDetails: w.workerProfile?.bankDetails || null,
                  verification: w.workerProfile?.verification || null,
                  timetable: w.workerProfile?.timetable || {},
              }
            : null,

        serviceDetails: {
            serviceId: { name: service.name || "—" },
            skillName: skill?.name || "General",
            price: b.price || 0,
        },

        bookingInfo: {
            date: b.bookingDate,
            time: b.bookingTime,
        },
        serviceInitiatedAt: b.serviceInitiatedAt,
        serviceStartedAt: b.serviceStartedAt,
        serviceCompletedAt: b.serviceCompletedAt,
    };
};

const createHandler = (status) => async (req, res) => {
    try {
        const workers = await getNonSmartphoneWorkers();
        const workerIds = workers.map((w) => w._id);
        if (!workerIds.length) return res.json({ success: true, data: [] });

        const query =
            status === "CANCELLED"
                ? {
                      workerId: { $in: workerIds },
                      status: { $in: ["CANCELLED", "DECLINED", "REJECTED"] },
                  }
                : status === "ALL"
                ? { workerId: { $in: workerIds } }
                : { workerId: { $in: workerIds }, status };

        const bookings = await Booking.find(query)
            .populate(populateBooking().populate)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings.map(formatBooking),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getPendingBookings = createHandler("PENDING");
export const getAssignedBookings = createHandler("ACCEPTED");
export const getInProgressBookings = createHandler("PAYMENT_PENDING");
export const getCompletedBookings = createHandler("COMPLETED");
export const getCancelledBookings = createHandler("CANCELLED");
export const getAllBookings = createHandler("ALL");

/**
 * @desc Get booking history for a specific non-smartphone worker (created by agent)
 * @route GET /api/service-agent/worker/:workerId/bookings
 */

export const getWorkerBookings = async (req, res) => {
    try {
        const { workerId } = req.params;
        
        // Validate workerId
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid worker ID format'
            });
        }

        // Check if worker exists and is actually a worker
        const worker = await User.findOne({
            _id: workerId,
            role: 'WORKER',
            isActive: true
        })
        .select('name phone email workerProfile address isActive')
        .lean();

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: 'Worker not found or inactive'
            });
        }

        // Get all bookings for this worker with populated data
        const bookings = await Booking.find({ 
            workerId: workerId 
        })
        .populate('customerId', 'name phone email address')
        .populate('serviceId', 'name category description')
        .populate('workerServiceId', 'price skills experience serviceId')
        .sort({ createdAt: -1 })
        .lean();

        // Transform the data for frontend
        const transformedBookings = await Promise.all(bookings.map(async (booking) => {
            const customer = booking.customerId || {};
            const service = booking.serviceId || {};
            const workerService = booking.workerServiceId || {};

            // Get skill name and service name from Skill collection
            let skillName = 'N/A';
            let serviceName = 'N/A';
            
            if (workerService.serviceId) {
                try {
                    const skillData = await Skill.findOne({
                        'services.serviceId': workerService.serviceId
                    }).select('name services').lean();

                    if (skillData) {
                        skillName = skillData.name || 'N/A';
                        
                        // Find the specific service within the skill
                        const specificService = skillData.services.find(
                            service => service.serviceId.toString() === workerService.serviceId.toString()
                        );
                        serviceName = specificService?.name || service.name || 'N/A';
                    }
                } catch (error) {
                    console.error('Error fetching skill data:', error);
                    // Fallback to service name if skill lookup fails
                    serviceName = service.name || 'N/A';
                }
            } else {
                // Fallback if no serviceId in workerService
                serviceName = service.name || 'N/A';
            }

            return {
                _id: booking._id,
                status: booking.status,
                customer: {
                    _id: customer._id,
                    name: customer.name || 'N/A',
                    phone: customer.phone || 'N/A',
                    email: customer.email,
                    address: customer.address || {}
                },
                worker: {
                    _id: worker._id,
                    name: worker.name,
                    phone: worker.phone,
                    email: worker.email
                },
                serviceDetails: {
                    serviceId: service,
                    skillName: skillName,
                    serviceName: serviceName,
                    price: workerService.price || booking.price || 0,
                    category: service.category,
                    description: service.description
                },
                bookingInfo: {
                    date: booking.bookingDate,
                    time: booking.bookingTime
                },
                timeline: {
                    serviceInitiatedAt: booking.serviceInitiatedAt,
                    serviceStartedAt: booking.serviceStartedAt,
                    serviceCompletedAt: booking.serviceCompletedAt,
                    createdAt: booking.createdAt
                },
                payment: booking.payment || {},
                review: booking.review || null,
                cancellationReason: booking.cancellationReason,
                declineReason: booking.declineReason
            };
        }));

        // Calculate counts by status
        const statusCounts = {
            PENDING: transformedBookings.filter(b => b.status === 'PENDING').length,
            ACCEPTED: transformedBookings.filter(b => b.status === 'ACCEPTED').length,
            IN_PROGRESS: transformedBookings.filter(b => b.status === 'PAYMENT_PENDING').length,
            COMPLETED: transformedBookings.filter(b => b.status === 'COMPLETED').length,
            CANCELLED: transformedBookings.filter(b => b.status === 'CANCELLED').length,
            DECLINED: transformedBookings.filter(b => b.status === 'DECLINED').length,
            ALL: transformedBookings.length
        };

        return res.status(200).json({
            success: true,
            message: 'Worker bookings retrieved successfully',
            data: {
                worker: {
                    _id: worker._id,
                    name: worker.name,
                    phone: worker.phone,
                    email: worker.email,
                    address: worker.address,
                    availabilityStatus: worker.workerProfile?.availabilityStatus || 'available',
                    isActive: worker.isActive,
                    createdByAgent: worker.workerProfile?.createdByAgent || false
                },
                bookings: transformedBookings,
                stats: statusCounts,
                totalBookings: transformedBookings.length
            }
        });

    } catch (error) {
        console.error('Get worker bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// controllers/serviceAgentController.js
export const updatePaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentType, status, transactionId, transactionDate, updatedBy = 'agent' } = req.body;

        // Validate booking ID
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        // Validate required fields
        if (!paymentType) {
            return res.status(400).json({
                success: false,
                message: 'Payment type is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Payment status is required'
            });
        }

        // Validate payment type
        const validPaymentTypes = ['CASH', 'RAZORPAY'];
        if (!validPaymentTypes.includes(paymentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment type. Must be CASH, UPI, or RAZORPAY'
            });
        }

        // Validate payment status
        const validPaymentStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
        if (!validPaymentStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status. Must be PENDING, COMPLETED, or FAILED'
            });
        }

        // Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking is in a state that allows payment updates
        if (booking.status === 'CANCELLED' || booking.status === 'DECLINED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update payment for cancelled or declined booking'
            });
        }

        // Prepare payment update data
        const paymentUpdateData = {
            paymentType,
            status,
            amount: booking.price, // Use booking price as payment amount
            updatedBy
        };

        // Add transaction details if provided
        if (transactionId) {
            paymentUpdateData.transactionId = transactionId;
        }

        if (transactionDate) {
            paymentUpdateData.transactionDate = new Date(transactionDate);
        } else if (status === 'COMPLETED') {
            paymentUpdateData.transactionDate = new Date();
        }

        // If payment is being marked as completed, also update booking status if needed
        if (status === 'COMPLETED' && booking.status === 'PAYMENT_PENDING') {
            booking.status = 'COMPLETED';
            booking.serviceCompletedAt = new Date();
        }

        // Update payment data
        booking.payment = {
            ...booking.payment,
            ...paymentUpdateData
        };

        await booking.save();

        // Get updated booking with populated data
        const updatedBooking = await Booking.findById(bookingId)
            .populate('customerId', 'name phone email address')
            .populate('serviceId', 'name category description')
            .populate('workerId', 'name phone')
            .lean();

        return res.status(200).json({
            success: true,
            message: `Payment status updated to ${status}`,
            data: {
                booking: updatedBooking,
                payment: booking.payment
            }
        });

    } catch (error) {
        console.error('Update payment status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * @desc    Get payment details for a booking
 * @route   GET /api/service-agent/bookings/:bookingId/payment
 * @access  Private (Service Agent)
 */
export const getPaymentDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Validate booking ID
        if (bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        // Find booking with payment details
        const booking = await Booking.findById(bookingId)
            .select('payment price status serviceDetails')
            .populate('customerId', 'name phone')
            .populate('serviceId', 'name category')
            .lean();

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Prepare payment response
        const paymentDetails = {
            bookingId: booking._id,
            customer: booking.customerId,
            service: booking.serviceId,
            amount: booking.price,
            status: booking.status,
            payment: booking.payment || {
                status: 'PENDING',
                paymentType: null,
                amount: booking.price
            }
        };

        return res.status(200).json({
            success: true,
            message: 'Payment details retrieved successfully',
            data: paymentDetails
        });

    } catch (error) {
        console.error('Get payment details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * @desc    Process refund for a booking
 * @route   POST /api/service-agent/bookings/:bookingId/refund
 * @access  Private (Service Agent)
 */
// controllers/workerController.js


/**
 * @desc    Get worker profile
 * @route   GET /api/worker/profile
 * @access  Private (Worker)
 */
export const getWorkerProfile = async (req, res) => {
    try {
        const workerId = req.user._id;

        const worker = await User.findById(workerId)
            .select('name phone email address workerProfile isActive')
            .lean();

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: 'Worker not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Worker profile retrieved successfully',
            data: worker
        });

    } catch (error) {
        console.error('Get worker profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

