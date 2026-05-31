function normalizeSkill(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function formatSkillLabel(value = "") {
  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 3 && /[A-Z]/.test(word)) {
        return word;
      }

      if (/[.+#]/.test(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

module.exports = {
  normalizeSkill,
  formatSkillLabel,
};
