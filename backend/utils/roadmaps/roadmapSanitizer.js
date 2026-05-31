const { formatSkillLabel } = require("../../services/ai/skillHelpers");

const PHASES = ["Beginner", "Intermediate", "Advanced"];

function stripCodeFences(payload = "") {
  return String(payload)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

function sanitizeRoadmapResponse(raw, targetSkill) {
  const parsed = typeof raw === "string" ? JSON.parse(stripCodeFences(raw)) : raw;
  const levels = Array.isArray(parsed?.levels) ? parsed.levels : [];

  return {
    title: formatSkillLabel(parsed?.title || targetSkill),
    levels: PHASES.map((phase) => {
      const phaseMatch = levels.find(
        (level) => String(level?.phase || "").trim().toLowerCase() === phase.toLowerCase()
      );
      const steps = Array.isArray(phaseMatch?.steps) ? phaseMatch.steps : [];

      return {
        phase,
        steps: steps.slice(0, 3).map((step, index) => ({
          title: String(step?.title || `${phase} Step ${index + 1}`).trim(),
          description: String(step?.description || `Progress through ${phase.toLowerCase()} ${targetSkill}.`).trim(),
          duration: String(step?.duration || "2 Weeks").trim(),
          difficulty: String(step?.difficulty || phase).trim(),
        })),
      };
    }),
  };
}

module.exports = {
  sanitizeRoadmapResponse,
};
