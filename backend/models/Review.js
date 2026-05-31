const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 600,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

reviewSchema.index({ toUser: 1, createdAt: -1 });
reviewSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
