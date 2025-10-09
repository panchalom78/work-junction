import { Skill } from "../models/skill.model.js";
import mongoose from "mongoose";

// Get all skills with their services
export const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: skills,
            message: "Skills retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get single skill by ID with all services
export const getSkillById = async (req, res) => {
    try {
        const { skillId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format",
            });
        }

        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            data: skill,
            message: "Skill retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching skill:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get services by skill ID
export const getServicesBySkillId = async (req, res) => {
    try {
        const { skillId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format",
            });
        }

        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                skill: skill.name,
                services: skill.services,
            },
            message: "Services retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Add new skill
export const addNewSkill = async (req, res) => {
    try {
        const { name, services = [] } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Skill name is required",
            });
        }

        // Check if skill already exists
        const existingSkill = await Skill.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message: "Skill with this name already exists",
            });
        }

        // Prepare services with auto-generated IDs
        const preparedServices = services.map((service) => ({
            serviceId: new mongoose.Types.ObjectId(),
            name: service.name.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        // Create new skill
        const newSkill = new Skill({
            name: name.trim(),
            services: preparedServices,
        });

        await newSkill.save();

        res.status(201).json({
            success: true,
            data: newSkill,
            message: "Skill created successfully",
        });
    } catch (error) {
        console.error("Error creating skill:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Skill with this name already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Add new service to existing skill
export const addServiceToSkill = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { name } = req.body;

        // Validation
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format",
            });
        }

        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Service name is required",
            });
        }

        // Find skill
        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        // Check if service already exists in this skill
        const existingService = skill.services.find(
            (service) =>
                service.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service with this name already exists in this skill",
            });
        }

        // Create new service
        const newService = {
            serviceId: new mongoose.Types.ObjectId(),
            name: name.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Add service to skill
        skill.services.push(newService);
        skill.updatedAt = new Date();

        await skill.save();

        res.status(201).json({
            success: true,
            data: newService,
            message: "Service added successfully",
        });
    } catch (error) {
        console.error("Error adding service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update service name
export const updateService = async (req, res) => {
    try {
        const { skillId, serviceId } = req.params;
        const { name } = req.body;

        // Validation
        if (
            !mongoose.Types.ObjectId.isValid(skillId) ||
            !mongoose.Types.ObjectId.isValid(serviceId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Service name is required",
            });
        }

        // Find skill and update service
        const skill = await Skill.findOneAndUpdate(
            {
                _id: skillId,
                "services.serviceId": serviceId,
            },
            {
                $set: {
                    "services.$.name": name.trim(),
                    "services.$.updatedAt": new Date(),
                },
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill or service not found",
            });
        }

        // Find updated service
        const updatedService = skill.services.find(
            (service) => service.serviceId.toString() === serviceId
        );

        res.status(200).json({
            success: true,
            data: updatedService,
            message: "Service updated successfully",
        });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Delete service from skill
export const deleteService = async (req, res) => {
    try {
        const { skillId, serviceId } = req.params;

        // Validation
        if (
            !mongoose.Types.ObjectId.isValid(skillId) ||
            !mongoose.Types.ObjectId.isValid(serviceId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        // Find skill and remove service
        const skill = await Skill.findByIdAndUpdate(
            skillId,
            {
                $pull: {
                    services: { serviceId: serviceId },
                },
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
