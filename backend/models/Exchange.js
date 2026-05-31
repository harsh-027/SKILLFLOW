const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillOffered: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    skillRequested: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

exchangeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Exchange", exchangeSchema);
