const mongoose = require("mongoose");

const pathStepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const learningPathLevelSchema = new mongoose.Schema(
  {
    phase: {
      type: String,
      required: true,
    },
    steps: {
      type: [pathStepSchema],
      default: [],
    },
  },
  { _id: false }
);

const learningPathSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetSkill: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "fallback",
      trim: true,
    },
    levels: {
      type: [learningPathLevelSchema],
      default: [],
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

learningPathSchema.index({ user: 1, targetSkill: 1, updatedAt: -1 });

module.exports = mongoose.model("LearningPath", learningPathSchema);
