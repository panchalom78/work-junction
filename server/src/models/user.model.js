import mongoose, { Schema } from "mongoose";

// Address Schema (Nested)
const addressSchema = new Schema(
    {
        houseNo: { type: String, trim: true },
        street: { type: String, trim: true },
        area: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        coordinates: {
            latitude: { type: String },
            longitude: { type: String },
        },
    },
    { _id: false }
);

const otpSchema = new Schema(
    {
        code: { type: String },
        purpose: {
            type: String,
            enum: ["REGISTRATION", "PASSWORD_RESET", "EMAIL_CHANGE"],
        },
        expiresAt: { type: Date },
        attempts: {
            type: Number,
            default: 0,
            max: 5,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Verification Schema (Nested for Worker)
const verificationSchema = new Schema(
    {
        verificationId: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },
        serviceAgentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        selfieUrl: { type: String },
        addharDocUrl: { type: String },
        policeVerificationDocUrl: { type: String },
        rejectionReason: { type: String },
        isSelfieVerified: { type: Boolean, default: false },
        isAddharDocVerified: { type: Boolean, default: false },
        isPoliceVerificationDocVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
    },
    { _id: false }
);

// Bank Details Schema (Nested for Worker)
const bankDetailsSchema = new Schema(
    {
        accountNumber: { type: String, trim: true },
        accountHolderName: { type: String, trim: true },
        IFSCCode: { type: String, trim: true, uppercase: true },
        bankName: { type: String, trim: true },
    },
    { _id: false }
);

// Timetable Schema (Nested for Worker)
const timetableSchema = new Schema(
    {
        Monday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
        Tuesday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
        Wednesday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
        Thursday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
        Friday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
        Saturday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
        Sunday: [
            {
                start: { type: String, default: "" },
                end: { type: String, default: "" },
            },
        ],
    },
    { _id: false }
);

// Non-Availability Schema (Nested Array for Worker)
const nonAvailabilitySchema = new Schema(
    {
        startDateTime: { type: Date, required: true }, // Combined date + start time
        endDateTime: { type: Date, required: true }, // Combined date + end time
        reason: { type: String, trim: true },
    },
    { _id: false }
);

// Service Agent Profile Schema (Nested)
const serviceAgentProfileSchema = new Schema(
    {
        assignedArea: { type: String, trim: true },
        isSuspended: { type: Boolean, default: false },
        suspendedUntil: { type: Date },
    },
    { _id: false }
);

// Worker Profile Schema (Nested) - UPDATED
const workerProfileSchema = new Schema(
    {
        preferredLanguage: { type: String, trim: true },
        availabilityStatus: {
            type: String,
            enum: ["available", "busy", "off-duty"],
            default: "available",
        },
        verification: verificationSchema,
        bankDetails: bankDetailsSchema,
        timetable: timetableSchema,
        nonAvailability: [nonAvailabilitySchema],
    },
    { _id: false }
);

// Customer Profile Schema (Nested)
const customerProfileSchema = new Schema(
    {
        preferredLanguage: { type: String, trim: true },
    },
    { _id: false }
);

// Main User Schema
const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^[0-9]{10}$/,
                "Please enter a valid 10-digit phone number",
            ],
        },
        role: {
            type: String,
            enum: ["ADMIN", "SERVICE_AGENT", "CUSTOMER", "WORKER"],
            required: true,
        },
        address: addressSchema,
        otp: {
            type: otpSchema,
            default: undefined,
        },
        isVerified: { type: Boolean, default: false },

        // Role-specific nested profiles
        serviceAgentProfile: {
            type: serviceAgentProfileSchema,
            default: undefined,
        },
        workerProfile: {
            type: workerProfileSchema,
            default: undefined,
        },
        customerProfile: {
            type: customerProfileSchema,
            default: undefined,
        },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "address.city": 1, "address.area": 1 });

// Method to check if OTP is expired
userSchema.methods.isOTPExpired = function () {
    if (!this.otp || !this.otp.expiresAt) {
        return true;
    }
    return Date.now() > this.otp.expiresAt.getTime();
};

// Method to increment OTP attempts
userSchema.methods.incrementOTPAttempts = async function () {
    if (!this.otp) {
        return 0;
    }
    this.otp.attempts += 1;
    await this.save();
    return this.otp.attempts;
};

// Method to clear OTP
userSchema.methods.clearOTP = async function () {
    this.otp = undefined;
    await this.save();
};

// Method to set OTP
userSchema.methods.setOTP = async function (
    code,
    purpose = "REGISTRATION",
    expiryMinutes = 10
) {
    this.otp = {
        code,
        purpose,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
        attempts: 0,
        createdAt: new Date(),
    };
    await this.save();
};

// Pre-save hook to ensure only relevant profile exists
userSchema.pre("save", function (next) {
    if (this.role === "WORKER" && !this.workerProfile) {
        this.workerProfile = {};
    } else if (this.role !== "WORKER") {
        this.workerProfile = undefined;
    }

    if (this.role === "CUSTOMER" && !this.customerProfile) {
        this.customerProfile = {};
    } else if (this.role !== "CUSTOMER") {
        this.customerProfile = undefined;
    }

    if (this.role === "SERVICE_AGENT" && !this.serviceAgentProfile) {
        this.serviceAgentProfile = {};
    } else if (this.role !== "SERVICE_AGENT") {
        this.serviceAgentProfile = undefined;
    }

    next();
});

const User = mongoose.model("User", userSchema);
export default User;
