import { Router } from "express";
const router = Router();

import {
    sendOTP,
    verifyOTP,
    resendOTP,
    getOTPStatus,
} from "../controllers/otp.controller.js";

import {
    sendOTPValidation,
    verifyOTPValidation,
    resendOTPValidation,
    getOTPStatusValidation,
} from "../middlewares/otpValidation.middleware.js";

// OTP routes
router.post("/send", sendOTPValidation, sendOTP);
router.post("/verify", verifyOTPValidation, verifyOTP);
router.post("/resend", resendOTPValidation, resendOTP);
router.get("/status/:email", getOTPStatusValidation, getOTPStatus);

export default router;
