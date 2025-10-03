import { randomInt } from "crypto";

/**
 * Generate a random OTP
 * @param {Number} length - Length of OTP (default: 6)
 * @returns {String} Generated OTP
 */
const generateOTP = (length = 6) => {
    // Generate random bytes and convert to number
    const otp = randomInt(Math.pow(10, length - 1), Math.pow(10, length));
    return otp.toString();
};

/**
 * Generate a secure random OTP using crypto
 * @param {Number} length - Length of OTP (default: 6)
 * @returns {String} Generated OTP
 */
const generateSecureOTP = (length = 6) => {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = randomInt(0, digits.length);
        otp += digits[randomIndex];
    }

    return otp;
};

/**
 * Check if OTP format is valid
 * @param {String} otp - OTP to validate
 * @param {Number} length - Expected length
 * @returns {Boolean} True if valid format
 */
const isValidOTPFormat = (otp, length = 6) => {
    const otpRegex = new RegExp(`^[0-9]{${length}}$`);
    return otpRegex.test(otp);
};

export { generateOTP, generateSecureOTP, isValidOTPFormat };
