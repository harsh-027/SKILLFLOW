const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const botProtection = require("../../middleware/botProtection");
const { validateRequest } = require("../../middleware/errorHandler");
const { aiRateLimiter } = require("../../middleware/rateLimiters");
const { createLearningPath } = require("../../controllers/ai/learningPathController");
const { getRecommendedSkills } = require("../../controllers/ai/recommendedSkillsController");
const {
  createLearningPathValidator,
  recommendedSkillsValidator,
} = require("../../validators/platformValidators");

const router = express.Router();

router.use(authMiddleware, aiRateLimiter, botProtection);

router.post("/learning-path", createLearningPathValidator, validateRequest, createLearningPath);
router.get(
  "/recommended-skills",
  recommendedSkillsValidator,
  validateRequest,
  getRecommendedSkills
);

module.exports = router;
