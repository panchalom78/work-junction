import express from "express";
import {
    getAllSkills,
    getSkillById,
    getServicesBySkillId,
    addNewSkill,
    addServiceToSkill,
    updateService,
    deleteService,
} from "../controllers/skill.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Get all skills with services
router.get("/", getAllSkills);

// Get specific skill by ID
router.get("/:skillId", getSkillById);

// Get services by skill ID
router.get("/:skillId/services", getServicesBySkillId);

// Add new skill (with optional initial services)
router.post("/", addNewSkill);

// Add new service to existing skill
router.post("/:skillId/services", addServiceToSkill);

// Update service name
router.put("/:skillId/services/:serviceId", updateService);

// Delete service from skill
router.delete("/:skillId/services/:serviceId", deleteService);

export default router;
