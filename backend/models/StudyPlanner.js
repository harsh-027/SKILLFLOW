const mongoose = require("mongoose");

const studyPlannerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1200,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1200,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: 0,
      max: 1000,
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: String,
      default: "",
      trim: true,
      match: /^$|^([01]\d|2[0-3]):[0-5]\d$/,
    },
    durationHours: {
      type: Number,
      default: 1,
      min: 0,
      max: 24,
    },
    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

studyPlannerSchema.index({ userId: 1, scheduledDate: 1, startTime: 1 });
studyPlannerSchema.index({ userId: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model("StudyPlanner", studyPlannerSchema);
