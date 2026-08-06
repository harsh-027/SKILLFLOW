const StudyPlanner = require("../models/StudyPlanner");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateAiStudyPlanEntries } = require("../services/ai/studyPlannerService");

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const buildPlannerPayload = (body, source = "manual") => ({
  title: body.title?.trim(),
  subject: body.subject?.trim(),
  description: body.description?.trim() || "",
  notes: body.notes?.trim() || "",
  priority: body.priority || "Medium",
  status: body.status || "Pending",
  dueDate: body.dueDate || null,
  estimatedHours: toNumber(body.estimatedHours, 1),
  actualHours: toNumber(body.actualHours, 0),
  scheduledDate: body.scheduledDate || null,
  startTime: body.startTime || "",
  durationHours: toNumber(body.durationHours, body.estimatedHours || 1),
  source,
});

const getStudyPlannerEntries = asyncHandler(async (req, res) => {
  const entries = await StudyPlanner.find({ userId: req.user._id }).sort({
    scheduledDate: 1,
    dueDate: 1,
    createdAt: -1,
  });

  return res.status(200).json(entries);
});

const createStudyPlannerEntry = asyncHandler(async (req, res) => {
  const entry = await StudyPlanner.create({
    userId: req.user._id,
    ...buildPlannerPayload(req.body),
  });

  return res.status(201).json(entry);
});

const updateStudyPlannerEntry = asyncHandler(async (req, res) => {
  const entry = await StudyPlanner.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) {
    throw new ApiError(404, "Study planner entry not found");
  }

  Object.assign(entry, buildPlannerPayload({ ...entry.toObject(), ...req.body }, entry.source));
  await entry.save();

  return res.status(200).json(entry);
});

const deleteStudyPlannerEntry = asyncHandler(async (req, res) => {
  const entry = await StudyPlanner.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!entry) {
    throw new ApiError(404, "Study planner entry not found");
  }

  return res.status(200).json({ message: "Study planner entry deleted" });
});

const generateAiStudyPlannerEntries = asyncHandler(async (req, res) => {
  const generatedEntries = await generateAiStudyPlanEntries(req.body);
  const savedEntries = await StudyPlanner.insertMany(
    generatedEntries.map((entry) => ({
      userId: req.user._id,
      ...buildPlannerPayload(entry, "ai"),
    }))
  );

  return res.status(201).json(savedEntries);
});

module.exports = {
  getStudyPlannerEntries,
  createStudyPlannerEntry,
  updateStudyPlannerEntry,
  deleteStudyPlannerEntry,
  generateAiStudyPlannerEntries,
};
