function buildRoadmapPrompt(targetSkill) {
  return [
    `Skill: "${targetSkill}"`,
    'Return JSON only: {"title":"Skill Name","levels":[{"phase":"Beginner","steps":[{"title":"Step","description":"Short description","duration":"2 Weeks","difficulty":"Beginner"}]}]}',
    "Rules: 3 phases only (Beginner, Intermediate, Advanced).",
    "Each phase must have exactly 3 steps.",
    "Descriptions under 18 words.",
    "Difficulty must equal phase.",
    "No markdown. No extra text.",
  ].join("\n");
}

module.exports = {
  buildRoadmapPrompt,
};
