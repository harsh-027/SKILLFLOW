const Exchange = require("../models/Exchange");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const createExchange = asyncHandler(async (req, res) => {
  if (req.body.userB === String(req.user._id)) {
    throw new ApiError(400, "You cannot create an exchange with yourself");
  }

  const targetUser = await User.findById(req.body.userB).select("_id isBanned");
  if (!targetUser || targetUser.isBanned) {
    throw new ApiError(404, "Target user not found");
  }

  const exchange = await Exchange.create({
    userA: req.user._id,
    userB: req.body.userB,
    skillOffered: req.body.skillOffered.trim(),
    skillRequested: req.body.skillRequested.trim(),
    status: "pending",
  });

  const populated = await exchange.populate([
    { path: "userA", select: "name userId avatar profileImage" },
    { path: "userB", select: "name userId avatar profileImage" },
  ]);

  return res.status(201).json(populated);
});

const getMyExchanges = asyncHandler(async (req, res) => {
  const exchanges = await Exchange.find({
    $or: [{ userA: req.user._id }, { userB: req.user._id }],
  })
    .populate("userA", "name userId avatar profileImage")
    .populate("userB", "name userId avatar profileImage")
    .sort({ createdAt: -1 });

  return res.status(200).json(exchanges);
});

const updateExchangeStatus = asyncHandler(async (req, res) => {
  const exchange = await Exchange.findById(req.params.id);
  if (!exchange) {
    throw new ApiError(404, "Exchange not found");
  }

  const isParticipant =
    String(exchange.userA) === String(req.user._id) || String(exchange.userB) === String(req.user._id);
  if (!isParticipant) {
    throw new ApiError(403, "You are not allowed to update this exchange");
  }

  const nextStatus = req.body.status;
  if (!["active", "completed", "cancelled"].includes(nextStatus)) {
    throw new ApiError(400, "Invalid exchange status");
  }

  exchange.status = nextStatus;
  await exchange.save();
  return res.status(200).json(exchange);
});

module.exports = {
  createExchange,
  getMyExchanges,
  updateExchangeStatus,
};
