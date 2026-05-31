const LearningPath = require("../../models/LearningPath");
const { getGroqClient, getGroqModel, hasGroqConfig } = require("./groqClient");
const { formatSkillLabel, normalizeSkill } = require("./skillHelpers");
const { getFallbackRoadmap } = require("../../utils/roadmaps/fallbackRoadmaps");
const { buildRoadmapPrompt } = require("../../utils/roadmaps/roadmapPrompt");
const { sanitizeRoadmapResponse } = require("../../utils/roadmaps/roadmapSanitizer");

async function generateRoadmapWithGroq(targetSkill) {
  const groqClient = getGroqClient();
  if (!groqClient) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const completion = await groqClient.chat.completions.create(
    {
      model: getGroqModel(),
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return compact, valid JSON roadmaps for technical skills.",
        },
        {
          role: "user",
          content: buildRoadmapPrompt(targetSkill),
        },
      ],
    },
    {
      maxRetries: 2,
      timeout: 15000,
    }
  );

  return sanitizeRoadmapResponse(completion.choices?.[0]?.message?.content || "{}", targetSkill);
}

async function saveLearningPath({ userId, targetSkill, roadmap, source }) {
  const savedPath = await LearningPath.create({
    user: userId,
    targetSkill: formatSkillLabel(targetSkill),
    title: roadmap.title,
    summary: `A structured ${formatSkillLabel(targetSkill)} roadmap from fundamentals through advanced application.`,
    source,
    levels: roadmap.levels,
  });

  return {
    _id: String(savedPath._id),
    targetSkill: savedPath.targetSkill,
    title: savedPath.title,
    summary: savedPath.summary,
    source: savedPath.source,
    generatedAt: savedPath.createdAt,
    fallback: source !== "groq",
    levels: savedPath.levels,
  };
}

async function generateLearningPath({ userId, targetSkill }) {
  const normalizedSkill = normalizeSkill(targetSkill);
  const fallbackRoadmap = getFallbackRoadmap(normalizedSkill);

  if (!hasGroqConfig()) {
    return saveLearningPath({
      userId,
      targetSkill: normalizedSkill,
      roadmap: fallbackRoadmap,
      source: "fallback",
    });
  }

  try {
    const roadmap = await generateRoadmapWithGroq(normalizedSkill);
    const hasCompleteLevels = roadmap.levels.every((level) => Array.isArray(level.steps) && level.steps.length === 3);

    return saveLearningPath({
      userId,
      targetSkill: normalizedSkill,
      roadmap: hasCompleteLevels ? roadmap : fallbackRoadmap,
      source: hasCompleteLevels ? "groq" : "fallback",
    });
  } catch (error) {
    console.warn(`Using fallback roadmap for ${normalizedSkill}: ${error.message}`);

    return saveLearningPath({
      userId,
      targetSkill: normalizedSkill,
      roadmap: fallbackRoadmap,
      source: "fallback",
    });
  }
}

module.exports = {
  generateLearningPath,
};
