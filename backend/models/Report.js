const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["user", "listing", "exchange", "platform"],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required() {
        return this.targetType !== "platform";
      },
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
