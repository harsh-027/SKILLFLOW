const mongoose = require("mongoose");

const siteReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 600,
    },
  },
  {
    timestamps: true,
  }
);

siteReviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SiteReview", siteReviewSchema);
