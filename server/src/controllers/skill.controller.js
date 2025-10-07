import { Skill } from "../models/skill.model.js";
import { WorkerService } from "../models/workerService.model.js";
import User from "../models/user.model.js";

// ----------------------- Skill Controllers -----------------------

// Add a new skill
export const addSkill = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Skill name is required" });

    const skill = await Skill.create({ name, description });
    res.status(201).json(skill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a service under a skill
export const addServiceToSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    let { name, description, price, duration } = req.body;

    if (!name) return res.status(400).json({ error: "Service name is required" });

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    price = price ? Number(price) : 0;
    duration = duration || "N/A";

    skill.services.push({ name, description, price, duration });
    await skill.save();

    res.status(200).json(skill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all skills
export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
