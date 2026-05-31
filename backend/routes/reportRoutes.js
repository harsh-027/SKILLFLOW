const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createReport } = require("../controllers/reportController");
const { validateRequest } = require("../middleware/errorHandler");
const { createReportValidator } = require("../validators/platformValidators");

const router = express.Router();

router.post("/", authMiddleware, createReportValidator, validateRequest, createReport);

module.exports = router;
