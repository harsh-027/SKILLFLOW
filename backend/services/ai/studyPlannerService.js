const { getGroqClient, getGroqModel, hasGroqConfig } = require("./groqClient");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function parseSubjects(subjects) {
  if (Array.isArray(subjects)) {
    return subjects.map((subject) => String(subject).trim()).filter(Boolean);
  }

  return String(subjects || "")
    .split(",")
    .map((subject) => subject.trim())
    .filter(Boolean);
}

function nextPreferredDates(examDate, preferredStudyDays) {
  const preferred = Array.isArray(preferredStudyDays) && preferredStudyDays.length
    ? preferredStudyDays
    : DAY_NAMES;
  const preferredSet = new Set(preferred.map((day) => day.toLowerCase()));
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(examDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    if (preferredSet.has(DAY_NAMES[cursor.getDay()].toLowerCase())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function buildFallbackEntries(input) {
  const subjects = parseSubjects(input.subjects);
  const dates = nextPreferredDates(input.examDate, input.preferredStudyDays);
  const sessionLength = Math.max(Number(input.preferredSessionLength) || 1, 0.5);
  const hoursPerDay = Math.max(Number(input.hoursAvailablePerDay) || sessionLength, sessionLength);
  const sessionsPerDay = Math.max(1, Math.floor(hoursPerDay / sessionLength));
  const entries = [];

  dates.forEach((date, dayIndex) => {
    for (let sessionIndex = 0; sessionIndex < sessionsPerDay; sessionIndex += 1) {
      const subject = subjects[(dayIndex + sessionIndex) % subjects.length] || "Study";
      const isFinalStretch = dates.length - dayIndex <= Math.max(2, Math.ceil(dates.length * 0.18));
      const taskType = isFinalStretch
        ? sessionIndex % 2 === 0
          ? "Revision"
          : "Mock Test"
        : dayIndex % 5 === 4
          ? "Practice"
          : "Focused Study";

      entries.push({
        title: `${taskType}: ${subject}`,
        subject,
        description: `${taskType} session tailored for ${input.currentSkillLevel || "your current level"}.`,
        notes: isFinalStretch ? "Review errors, formulas, and weak areas before moving on." : "Keep notes editable as you study.",
        priority: isFinalStretch ? "High" : dayIndex % 3 === 0 ? "Medium" : "Low",
        status: "Pending",
        dueDate: toDateOnly(date),
        estimatedHours: sessionLength,
        actualHours: 0,
        scheduledDate: toDateOnly(date),
        startTime: `${String(9 + sessionIndex * 2).padStart(2, "0")}:00`,
        durationHours: sessionLength,
      });
    }
  });

  return entries.slice(0, 90);
}

function sanitizeAiEntries(content, input) {
  const parsed = JSON.parse(content || "{}");
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  const subjects = parseSubjects(input.subjects);

  return entries
    .map((entry) => ({
      title: String(entry.title || "").trim(),
      subject: String(entry.subject || subjects[0] || "Study").trim(),
      description: String(entry.description || "").trim(),
      notes: String(entry.notes || "").trim(),
      priority: ["Low", "Medium", "High"].includes(entry.priority) ? entry.priority : "Medium",
      status: "Pending",
      dueDate: entry.dueDate || entry.scheduledDate || null,
      estimatedHours: Number(entry.estimatedHours) || Number(input.preferredSessionLength) || 1,
      actualHours: 0,
      scheduledDate: entry.scheduledDate || entry.dueDate || null,
      startTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.startTime || "") ? entry.startTime : "09:00",
      durationHours: Number(entry.durationHours) || Number(input.preferredSessionLength) || 1,
    }))
    .filter((entry) => entry.title && entry.subject && entry.scheduledDate)
    .slice(0, 90);
}

async function generateAiStudyPlanEntries(input) {
  if (!hasGroqConfig()) {
    return buildFallbackEntries(input);
  }

  const groqClient = getGroqClient();
  const subjects = parseSubjects(input.subjects);

  try {
    const completion = await groqClient.chat.completions.create(
      {
        model: getGroqModel(),
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Return compact valid JSON only. Create editable study planner entries, never an automatic background schedule.",
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction:
                "Generate a balanced exam study schedule from today until the exam date. Include revision and mock test days, avoid overload, and respect available hours.",
              today: toDateOnly(new Date()),
              examDate: input.examDate,
              subjects,
              currentSkillLevel: input.currentSkillLevel,
              hoursAvailablePerDay: input.hoursAvailablePerDay,
              preferredStudyDays: input.preferredStudyDays,
              preferredSessionLength: input.preferredSessionLength,
              schema:
                "Return { entries: [{ title, subject, description, notes, priority, dueDate, estimatedHours, scheduledDate, startTime, durationHours }] }",
            }),
          },
        ],
      },
      {
        maxRetries: 2,
        timeout: 20000,
      }
    );

    const entries = sanitizeAiEntries(completion.choices?.[0]?.message?.content, input);
    return entries.length ? entries : buildFallbackEntries(input);
  } catch (error) {
    console.warn(`Using fallback study planner generation: ${error.message}`);
    return buildFallbackEntries(input);
  }
}

module.exports = {
  generateAiStudyPlanEntries,
};
