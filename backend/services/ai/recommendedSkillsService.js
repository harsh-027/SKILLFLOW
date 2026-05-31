const { formatSkillLabel, normalizeSkill } = require("./skillHelpers");

const RECOMMENDATION_MAP = {
  react: ["TypeScript", "Next.js", "Redux", "Testing Library"],
  python: ["FastAPI", "Pandas", "Machine Learning", "Automation"],
  javascript: ["TypeScript", "React", "Node.js", "Testing"],
  node: ["Express", "MongoDB", "REST APIs", "Authentication"],
  "node.js": ["Express", "MongoDB", "REST APIs", "Authentication"],
  uiux: ["Figma", "Motion Design", "Design Systems", "Prototyping"],
  "ui ux": ["Figma", "Motion Design", "Design Systems", "Prototyping"],
  design: ["Figma", "Design Systems", "Accessibility", "User Research"],
  frontend: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
  backend: ["Node.js", "Databases", "API Design", "System Design"],
  data: ["SQL", "Pandas", "Visualization", "Statistics"],
};

function buildReason(anchorSkill, source) {
  if (anchorSkill) {
    return `Pairs naturally with ${anchorSkill} based on your current direction.`;
  }

  return `Suggested from your ${source} skill profile.`;
}

function rankRecommendations({ currentSkills = [], selectedSkill = "" }) {
  const normalizedSelectedSkill = normalizeSkill(selectedSkill);
  const normalizedSkills = Array.from(
    new Set(currentSkills.map(normalizeSkill).filter(Boolean).concat(normalizedSelectedSkill || []))
  );
  const seen = new Set(normalizedSkills);
  const ranked = [];

  normalizedSkills.forEach((skill, skillIndex) => {
    const matches = RECOMMENDATION_MAP[skill] || [];

    matches.forEach((name, index) => {
      const normalizedName = normalizeSkill(name);
      if (!normalizedName || seen.has(normalizedName)) {
        return;
      }

      ranked.push({
        id: normalizedName.replace(/[^a-z0-9]+/g, "-"),
        name,
        confidence: Math.max(62, 90 - skillIndex * 6 - index * 5),
        reason: buildReason(formatSkillLabel(skill), selectedSkill ? "selected" : "existing"),
      });
      seen.add(normalizedName);
    });
  });

  if (!ranked.length) {
    ["Communication", "Project Planning", "Problem Solving"].forEach((name, index) => {
      ranked.push({
        id: normalizeSkill(name).replace(/[^a-z0-9]+/g, "-"),
        name,
        confidence: 60 - index * 4,
        reason: "Useful supporting skill when your profile does not map to a stronger rule yet.",
      });
    });
  }

  return ranked.slice(0, 4);
}

module.exports = {
  rankRecommendations,
};
