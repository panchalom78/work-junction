const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Main User Schema
// This is the base schema for all user types. It uses a 'role' field
// as a discriminator key to differentiate between Customer, Worker, and other roles.
const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: false },
        role: {
            type: String,
            required: true,
            enum: ["customer", "worker", "serviceAgent", "admin"],
        },
        address: {
            houseNo: { type: String, required: false },
            street: { type: String, required: false },
            area: { type: String, required: false },
            city: { type: String, required: false },
            state: { type: String, required: false },
            pincode: { type: String, required: false },
        },
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], required: false }, // [longitude, latitude]
        },
    },
    { discriminatorKey: "role" }
);

const User = mongoose.model("User", userSchema);

// Customer Schema (Discriminator)
// Extends the User schema with customer-specific fields.
const customerSchema = new Schema({
    preferredLanguage: { type: String, required: false },
});

const Customer = User.discriminator("customer", customerSchema);

// Worker Schema (Discriminator)
// Extends the User schema with worker-specific fields.
const workerSchema = new Schema({
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }], // Reference to the Skill model
    services: [
        {
            // Services the worker provides
            serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
            pricingType: {
                type: String,
                required: true,
                enum: ["fixed", "hourly"],
            },
            price: { type: Number, required: true },
        },
    ],
    verificationStatus: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "verified", "rejected"],
    },
});

const Worker = User.discriminator("worker", workerSchema);

// ServiceAgent Schema (Discriminator)
// Extends the User schema with service agent-specific fields.
const serviceAgentSchema = new Schema({
    assignedArea: { type: String, required: false },
});

const ServiceAgent = User.discriminator("serviceAgent", serviceAgentSchema);

// Admin Schema (Discriminator)
// Extends the User schema for the admin role.
const adminSchema = new Schema({});
const Admin = User.discriminator("admin", adminSchema);

// Booking Schema
const bookingSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "accepted", "completed", "cancelled", "in-progress"],
    },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    price: { type: Number, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: false },
    reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: false },
});

const Booking = mongoose.model("Booking", bookingSchema);

// Payment Schema
const paymentSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ["pending", "completed", "failed"],
    },
    paymentType: { type: String, required: false },
});

const Payment = mongoose.model("Payment", paymentSchema);

// ChatMessage Schema
const chatMessageSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: false },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// Review Schema
const reviewSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
});

const Review = mongoose.model("Review", reviewSchema);

// PortfolioImage Schema
const portfolioImageSchema = new Schema({
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, required: false },
});

const PortfolioImage = mongoose.model("PortfolioImage", portfolioImageSchema);

// Verification Schema
const verificationSchema = new Schema({
    workerId: {
        type: Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
        unique: true,
    },
    serviceAgentId: {
        type: Schema.Types.ObjectId,
        ref: "ServiceAgent",
        required: false,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "approved", "rejected"],
    },
    selfieUrl: { type: String, required: false },
    addharDocUrl: { type: String, required: false },
    policeVerificationDocUrl: { type: String, required: false },
    rejectionReason: { type: String, required: false },
});

const Verification = mongoose.model("Verification", verificationSchema);

// Skill Schema
const skillSchema = new Schema({
    name: { type: String, required: true, unique: true },
});

const Skill = mongoose.model("Skill", skillSchema);

// Service Schema
// This model represents a specific service, e.g., "Leak Repair".
const serviceSchema = new Schema({
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    category: { type: String, required: true }, // e.g., "Plumbing"
    subcategory: { type: String, required: false }, // e.g., "Pipes"
    name: { type: String, required: true, unique: true },
});

const Service = mongoose.model("Service", serviceSchema);

// Availability Schema
const availabilitySchema = new Schema({
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String, required: false },
});

const Availability = mongoose.model("Availability", availabilitySchema);

// BankDetails Schema
const bankDetailsSchema = new Schema({
    workerId: {
        type: Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
        unique: true,
    },
    accountNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    IFSCCode: { type: String, required: true },
    bankName: { type: String, required: true },
});

const BankDetails = mongoose.model("BankDetails", bankDetailsSchema);

// Export all models
module.exports = {
    User,
    Customer,
    Worker,
    ServiceAgent,
    Admin,
    Booking,
    Payment,
    ChatMessage,
    Review,
    PortfolioImage,
    Verification,
    Skill,
    Service,
    Availability,
    BankDetails,
};
