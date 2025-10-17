import mongoose from "mongoose";

const serviceAgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  areasAssigned: [{ type: String, trim: true }],
  serviceRadius: { type: Number, default: 10 }, // in km
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  assignedDate: { type: Date, default: Date.now },
  reviewedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  reviewedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
    default: "PENDING",
  },
  rejectionReason: { type: String, default: null },
  totalWorkersHandled: { type: Number, default: 0 },
  pendingVerifications: { type: Number, default: 0 },
  completedVerifications: { type: Number, default: 0 },
  activeWorkers: { type: Number, default: 0 },
  inactiveWorkers: { type: Number, default: 0 },
  performanceScore: { type: Number, default: 0 },
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date, default: null },
  suspensionReason: { type: String, default: null },
  contactEmail: { type: String, trim: true },
  contactPhone: { type: String, trim: true },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

serviceAgentSchema.index({ location: "2dsphere" });
serviceAgentSchema.index({ areasAssigned: 1 });

export default mongoose.model("ServiceAgent", serviceAgentSchema);