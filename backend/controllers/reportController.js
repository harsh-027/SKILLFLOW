const Report = require("../models/Report");
const asyncHandler = require("../utils/asyncHandler");

const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    reportedBy: req.user._id,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
    reason: req.body.reason.trim(),
  });

  return res.status(201).json(report);
});

module.exports = { createReport };
