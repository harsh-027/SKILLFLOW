const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const {
  createStudyPlannerValidator,
  generateStudyPlannerValidator,
  objectIdParam,
} = require("../validators/platformValidators");
const {
  createStudyPlannerEntry,
  deleteStudyPlannerEntry,
  generateAiStudyPlannerEntries,
  getStudyPlannerEntries,
  updateStudyPlannerEntry,
} = require("../controllers/studyPlannerController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getStudyPlannerEntries);
router.post("/", createStudyPlannerValidator, validateRequest, createStudyPlannerEntry);
router.post("/generate-ai", generateStudyPlannerValidator, validateRequest, generateAiStudyPlannerEntries);
router.put("/:id", objectIdParam(), createStudyPlannerValidator, validateRequest, updateStudyPlannerEntry);
router.delete("/:id", objectIdParam(), validateRequest, deleteStudyPlannerEntry);

module.exports = router;
