const asyncHandler = require("../../utils/asyncHandler");
const { rankRecommendations } = require("../../services/ai/recommendedSkillsService");

const getRecommendedSkills = asyncHandler(async (req, res) => {
  const selectedSkill = typeof req.query.skill === "string" ? req.query.skill.trim() : "";
  const currentSkills = [
    ...(Array.isArray(req.user.skillsOffered) ? req.user.skillsOffered : []),
    ...(Array.isArray(req.user.skillsWanted) ? req.user.skillsWanted : []),
  ];

  const recommendations = rankRecommendations({
    currentSkills,
    selectedSkill,
  });

  return res.status(200).json({
    recommendations,
    selectedSkill,
    generatedAt: new Date().toISOString(),
  });
});

module.exports = {
  getRecommendedSkills,
};
