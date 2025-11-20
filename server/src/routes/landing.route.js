import express from "express";
import { getLandingPageStats } from "../controllers/landing.controller.js";

const router = express.Router();

router.get("/stats", getLandingPageStats);

export default router;
