const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { validateRequest } = require("../../middleware/errorHandler");
const { aiRateLimiter } = require("../../middleware/rateLimiters");
const { createLearningPath } = require("../../controllers/ai/learningPathController");
const { getRecommendedSkills } = require("../../controllers/ai/recommendedSkillsController");
const {
  createLearningPathValidator,
  recommendedSkillsValidator,
} = require("../../validators/platformValidators");

const router = express.Router();

router.use(aiRateLimiter);

router.post("/learning-path", authMiddleware, createLearningPathValidator, validateRequest, createLearningPath);
router.get(
  "/recommended-skills",
  authMiddleware,
  recommendedSkillsValidator,
  validateRequest,
  getRecommendedSkills
);

module.exports = router;
