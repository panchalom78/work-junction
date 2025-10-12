// models/ServiceAgent.js
import mongoose from "mongoose";

const serviceAgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Basic location info
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, "Invalid Indian pincode"],
  },

  preferredAreas: [{ type: String, trim: true }],
  areasAssigned: [{ type: String, trim: true }],
  serviceRadius: { type: Number, default: 10 }, // in km

  // 🌍 Geolocation (for admin dashboard and search)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (val) => val.length === 2,
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },

  // Admin assignment info
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  assignedDate: { type: Date, default: Date.now },

  // Approval / Review workflow
  reviewedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  reviewedAt: { type: Date, default: null },

  // Status tracking
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
    default: "PENDING",
  },
  rejectionReason: { type: String, default: null },

  // Performance & activity tracking
  totalWorkersHandled: { type: Number, default: 0 },
  pendingVerifications: { type: Number, default: 0 },
  completedVerifications: { type: Number, default: 0 },
  activeWorkers: { type: Number, default: 0 },
  inactiveWorkers: { type: Number, default: 0 },
  performanceScore: { type: Number, default: 0 },

  // Suspension control
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date, default: null },
  suspensionReason: { type: String, default: null },

  // Contact info
  contactEmail: { type: String, trim: true },
  contactPhone: { type: String, trim: true },

  // Logs
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

// Geospatial index
serviceAgentSchema.index({ location: "2dsphere" });
serviceAgentSchema.index({ city: 1, areasAssigned: 1 });

export default mongoose.model("ServiceAgent", serviceAgentSchema);
