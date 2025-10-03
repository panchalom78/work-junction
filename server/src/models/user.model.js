import mongoose, { Schema } from "mongoose";
// models/User.js

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
        selfieUrl: { type: String },
        addharDocUrl: { type: String },
        policeVerificationDocUrl: { type: String },
        rejectionReason: { type: String },
        isSelfieVerified: { type: Boolean, default: false },
        isAddharDocVerified: { type: Boolean, default: false },
        isPoliceVerificationDocVerified: { type: Boolean, default: false },
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
        Monday: { type: String, default: "" },
        Tuesday: { type: String, default: "" },
        Wednesday: { type: String, default: "" },
        Thursday: { type: String, default: "" },
        Friday: { type: String, default: "" },
        Saturday: { type: String, default: "" },
        Sunday: { type: String, default: "" },
    },
    { _id: false }
);

// Non-Availability Schema (Nested Array for Worker)
const nonAvailabilitySchema = new Schema(
    {
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true },
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

// Worker Profile Schema (Nested)
const workerProfileSchema = new Schema(
    {
        preferredLanguage: { type: String, trim: true },
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
