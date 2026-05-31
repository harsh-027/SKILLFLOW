const mongoose = require("mongoose");

const skillListingSchema = new mongoose.Schema(
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
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

skillListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SkillListing", skillListingSchema);
