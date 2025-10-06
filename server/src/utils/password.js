import { hash as _hash, argon2id, verify } from "argon2";

/**
 * Hash password using Argon2
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (password) => {
    try {
        const hash = await _hash(password, {
            type: argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });
        return hash;
    } catch (error) {
        throw new Error("Error hashing password");
    }
};

/**
 * Verify password against hash
 * @param {String} hash - Stored password hash
 * @param {String} password - Plain text password to verify
 * @returns {Promise<Boolean>} True if password matches
 */
const verifyPassword = async (hash, password) => {
    try {
        return await verify(hash, password);
    } catch (error) {
        throw new Error("Error verifying password");
    }
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export { hashPassword, verifyPassword, validatePasswordStrength };
