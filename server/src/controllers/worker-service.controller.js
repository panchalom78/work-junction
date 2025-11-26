import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";
import mongoose from "mongoose";
import {
    cloudinary,
    deleteFromCloudinary,
    extractPublicId,
} from "../config/cloudinary.js";

// Add service to worker profile
export const addWorkerService = async (req, res) => {
    try {
        const { _id: workerId } = req.user;
        const {
            skillId,
            serviceId,
            details,
            pricingType,
            price,
            estimatedDuration,
        } = req.body;

        // Validation
        if (!skillId || !serviceId || !pricingType || price === undefined) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: skillId, serviceId, pricingType, price",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(skillId) ||
            !mongoose.Types.ObjectId.isValid(serviceId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid skillId or serviceId format",
            });
        }

        // Check if skill exists
        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        // Check if service exists in the skill
        const serviceExists = skill.services.some(
            (service) => service.serviceId.toString() === serviceId
        );

        if (!serviceExists) {
            return res.status(404).json({
                success: false,
                message: "Service not found in the selected skill",
            });
        }

        // Check if worker already has this service
        const existingService = await WorkerService.findOne({
            workerId,
            skillId,
            serviceId,
        });

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service already exists in your profile",
            });
        }

        // Create new worker service
        const workerService = new WorkerService({
            workerId,
            skillId,
            serviceId,
            details:
                details ||
                `Professional ${
                    skill.services.find(
                        (s) => s.serviceId.toString() === serviceId
                    )?.name
                } service`,
            pricingType,
            price: parseFloat(price),
            estimatedDuration: parseInt(estimatedDuration) || 1,
            portfolioImages: [],
        });

        await workerService.save();

        // Populate skill and service details for response
        const populatedService = await getFormattedService(workerService._id);

        res.status(201).json({
            success: true,
            message: "Service added successfully",
            data: populatedService,
        });
    } catch (error) {
        console.error("Error adding worker service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all services for a worker
export const getWorkerServices = async (req, res) => {
    try {
        const { _id: workerId } = req.user;

        const workerServices = await WorkerService.find({
            workerId,
            isActive: true,
        })
            .populate("skillId", "name")
            .sort({ createdAt: -1 });

        // Format response with service names
        const formattedServices = await Promise.all(
            workerServices.map(async (service) => {
                return await getFormattedService(service._id);
            })
        );

        res.status(200).json({
            success: true,
            data: formattedServices,
            message: "Worker services retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching worker services:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update worker service
export const updateWorkerService = async (req, res) => {
    try {
        const { _id: workerId } = req.user;
        const { serviceId } = req.params;
        const { details, pricingType, price, estimatedDuration, isActive } =
            req.body;

        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID format",
            });
        }

        // Find and update the service
        const updatedService = await WorkerService.findOneAndUpdate(
            { _id: serviceId, workerId },
            {
                ...(details && { details }),
                ...(pricingType && { pricingType }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(estimatedDuration && { estimatedDuration }),
                ...(isActive !== undefined && { isActive }),
            },
            { new: true, runValidators: true }
        ).populate("skillId", "name");

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message:
                    "Service not found or you don't have permission to update it",
            });
        }

        const formattedService = await getFormattedService(updatedService._id);

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: formattedService,
        });
    } catch (error) {
        console.error("Error updating worker service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Delete worker service (soft delete)
export const deleteWorkerService = async (req, res) => {
    try {
        const { _id: workerId } = req.user;
        const { serviceId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID format",
            });
        }

        // First get the service to delete portfolio images
        const service = await WorkerService.findOne({
            _id: serviceId,
            workerId,
        });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Delete all portfolio images from Cloudinary
        if (service.portfolioImages && service.portfolioImages.length > 0) {
            for (const image of service.portfolioImages) {
                try {
                    const publicId = extractPublicId(image.imageUrl);
                    if (publicId) {
                        await deleteFromCloudinary(publicId);
                    }
                } catch (error) {
                    console.error(
                        "Error deleting image from Cloudinary:",
                        error
                    );
                    // Continue with deletion even if image deletion fails
                }
            }
        }

        // Soft delete by setting isActive to false
        await WorkerService.findOneAndUpdate(
            { _id: serviceId, workerId },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting worker service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Add portfolio image to service
export const addPortfolioImage = async (req, res) => {
    try {
        const { _id: workerId } = req.user;
        const { serviceId } = req.params;
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID format",
            });
        }

        const service = await WorkerService.findOne({
            _id: serviceId,
            workerId,
        });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Create new portfolio image
        const newImage = {
            imageId: new mongoose.Types.ObjectId(),
            imageUrl: req.file.path,
            caption: caption || "",
            uploadedAt: new Date(),
        };

        // Add image to service
        service.portfolioImages.push(newImage);
        await service.save();

        const formattedService = await getFormattedService(service._id);

        res.status(201).json({
            success: true,
            message: "Portfolio image added successfully",
            data: {
                image: newImage,
                service: formattedService,
            },
        });
    } catch (error) {
        console.error("Error adding portfolio image:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Delete portfolio image
export const deletePortfolioImage = async (req, res) => {
    try {
        const { _id: workerId } = req.user;
        const { serviceId, imageId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(serviceId) ||
            !mongoose.Types.ObjectId.isValid(imageId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID or image ID format",
            });
        }

        const service = await WorkerService.findOne({
            _id: serviceId,
            workerId,
        });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Find the image to delete
        const imageIndex = service.portfolioImages.findIndex(
            (img) => img.imageId.toString() === imageId
        );
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Portfolio image not found",
            });
        }

        const imageToDelete = service.portfolioImages[imageIndex];

        // Delete from Cloudinary
        try {
            const publicId = extractPublicId(imageToDelete.imageUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
            // Continue with deletion even if Cloudinary deletion fails
        }

        // Remove image from array
        service.portfolioImages.splice(imageIndex, 1);
        await service.save();

        const formattedService = await getFormattedService(service._id);

        res.status(200).json({
            success: true,
            message: "Portfolio image deleted successfully",
            data: formattedService,
        });
    } catch (error) {
        console.error("Error deleting portfolio image:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update portfolio image caption
export const updatePortfolioImageCaption = async (req, res) => {
    try {
        const { _id: workerId } = req.user;
        const { serviceId, imageId } = req.params;
        const { caption } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(serviceId) ||
            !mongoose.Types.ObjectId.isValid(imageId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID or image ID format",
            });
        }

        const service = await WorkerService.findOne({
            _id: serviceId,
            workerId,
        });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Find and update the image caption
        const image = service.portfolioImages.find(
            (img) => img.imageId.toString() === imageId
        );
        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Portfolio image not found",
            });
        }

        image.caption = caption || "";
        await service.save();

        const formattedService = await getFormattedService(service._id);

        res.status(200).json({
            success: true,
            message: "Portfolio image caption updated successfully",
            data: formattedService,
        });
    } catch (error) {
        console.error("Error updating portfolio image caption:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Helper function to format service response
const getFormattedService = async (serviceId) => {
    const service = await WorkerService.findById(serviceId).populate(
        "skillId",
        "name"
    );

    if (!service) return null;

    const skill = await Skill.findById(service.skillId);
    const serviceInfo = skill.services.find(
        (s) => s.serviceId.toString() === service.serviceId.toString()
    );

    return {
        _id: service._id,
        serviceName: serviceInfo?.name || "Unknown Service",
        skillName: service.skillId.name,
        skillId: service.skillId._id,
        serviceId: service.serviceId,
        details: service.details,
        pricingType: service.pricingType,
        price: service.price,
        estimatedDuration: service.estimatedDuration,
        portfolioImages: service.portfolioImages || [],
        isActive: service.isActive,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
    };
};
