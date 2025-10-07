// routes/skill.routes.js
import express from "express";
import { addSkill, addServiceToSkill, getAllSkills } from "../controllers/skill.controller.js";

const router = express.Router();

router.post("/addSkills", addSkill);                         // Add a new skill
router.post("/:skillId/services", addServiceToSkill); // Add service to a skill
router.get("/getSkills", getAllSkills);


export default router;
