const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillOffered: {
    type: String,
    required: true,
    trim: true,
  },
  skillWanted: {
    type: String,
    required: true,
    trim: true,
  },
  // Legacy fields kept optional for backward compatibility with older documents.
  offeredSkill: {
    type: String,
    trim: true,
  },
  requestedSkill: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
