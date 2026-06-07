const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser } = require("../utils/userSanitizer");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id }, role: "user" })
    .select("-password -mfaSecret")
    .sort({ createdAt: -1 });

  return res.status(200).json(users.map(sanitizeUser));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -mfaSecret");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(sanitizeUser(user));
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "userId",
    "name",
    "bio",
    "location",
    "avatar",
    "banner",
    "skillsOffered",
    "skillsWanted",
    "interests",
    "learningGoals",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (typeof updates.userId === "string") {
    updates.userId = updates.userId.trim().toLowerCase();
  }

  if (typeof updates.name === "string") {
    updates.name = updates.name.trim();
  }

  if (Array.isArray(updates.skillsOffered)) {
    updates.skillsOffered = updates.skillsOffered
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (Array.isArray(updates.skillsWanted)) {
    updates.skillsWanted = updates.skillsWanted
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (Array.isArray(updates.interests)) {
    updates.interests = updates.interests
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (Array.isArray(updates.learningGoals)) {
    updates.learningGoals = updates.learningGoals
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -mfaSecret");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(sanitizeUser(updatedUser));
});

const followUser = asyncHandler(async (req, res) => {
  const currentUserId = String(req.user._id);
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (currentUser.following.some((id) => String(id) === targetUserId)) {
    throw new ApiError(400, "Already following this user");
  }

  currentUser.following.push(targetUser._id);
  targetUser.followers.push(currentUser._id);
  await Promise.all([currentUser.save(), targetUser.save()]);

  return res.status(200).json({ message: "User followed successfully" });
});

const unfollowUser = asyncHandler(async (req, res) => {
  const currentUserId = String(req.user._id);
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    throw new ApiError(404, "User not found");
  }

  currentUser.following = currentUser.following.filter((id) => String(id) !== targetUserId);
  targetUser.followers = targetUser.followers.filter((id) => String(id) !== currentUserId);
  await Promise.all([currentUser.save(), targetUser.save()]);

  return res.status(200).json({ message: "User unfollowed successfully" });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateMyProfile,
  followUser,
  unfollowUser,
};
