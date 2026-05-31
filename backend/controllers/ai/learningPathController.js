const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { generateLearningPath } = require("../../services/ai/learningPathService");

const createLearningPath = asyncHandler(async (req, res) => {
  const targetSkill = typeof req.body.targetSkill === "string" ? req.body.targetSkill.trim() : "";
  if (!targetSkill) {
    throw new ApiError(400, "targetSkill is required");
  }

  const learningPath = await generateLearningPath({
    userId: req.user.id,
    targetSkill,
  });

  return res.status(201).json(learningPath);
});

module.exports = {
  createLearningPath,
};
