const User = require("../models/User");
const SkillListing = require("../models/SkillListing");
const Exchange = require("../models/Exchange");
const Review = require("../models/Review");
const Report = require("../models/Report");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser } = require("../utils/userSanitizer");
const { recordAuditLog } = require("../utils/audit");

const getRecentGrowth = async (Model, match = {}) => {
  const rangeStart = new Date();
  rangeStart.setDate(1);
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setMonth(rangeStart.getMonth() - 5);

  const buckets = await Model.aggregate([
    {
      $match: {
        ...match,
        createdAt: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const bucketMap = new Map(
    buckets.map((bucket) => [`${bucket._id.year}-${bucket._id.month}`, bucket.count])
  );

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + index, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    return {
      name: date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      count: bucketMap.get(key) || 0,
    };
  });
};

const getSkillCategoryBreakdown = async () => {
  const categories = await SkillListing.aggregate([
    {
      $match: {
        status: "active",
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            {
              $or: [
                { $eq: ["$category", null] },
                { $eq: [{ $trim: { input: "$category" } }, ""] },
              ],
            },
            "Uncategorized",
            { $trim: { input: "$category" } },
          ],
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 6 },
  ]);

  const total = categories.reduce((sum, category) => sum + category.count, 0);

  return categories.map((category) => ({
    name: category._id,
    count: category.count,
    value: total === 0 ? 0 : Number(((category.count / total) * 100).toFixed(1)),
  }));
};

const recalculateUserRating = async (userId) => {
  const reviews = await Review.find({ toUser: userId }).select("rating");
  const ratingsCount = reviews.length;
  const rating =
    ratingsCount === 0
      ? 0
      : Number(
          (reviews.reduce((sum, review) => sum + review.rating, 0) / ratingsCount).toFixed(2)
        );

  await User.findByIdAndUpdate(userId, { rating, ratingsCount });
};

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -mfaSecret").sort({ createdAt: -1 });
  return res.status(200).json(users.map(sanitizeUser));
});

const getDashboard = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    totalUsers,
    totalAdmins,
    totalListings,
    totalExchanges,
    openReports,
    activeUsers,
    recentUsers,
    userGrowth,
    skillCategories,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    SkillListing.countDocuments({ status: "active" }),
    Exchange.countDocuments(),
    Report.countDocuments({ status: "open" }),
    User.countDocuments({
      isBanned: false,
      lastLoginAt: { $gte: sevenDaysAgo },
    }),
    User.find().select("-password -mfaSecret").sort({ createdAt: -1 }).limit(8),
    getRecentGrowth(User),
    getSkillCategoryBreakdown(),
  ]);

  return res.status(200).json({
    totalUsers,
    totalAdmins,
    totalListings,
    totalExchanges,
    openReports,
    activeUsers,
    recentUsers: recentUsers.map(sanitizeUser),
    userGrowth,
    skillCategories,
  });
});

const toggleUserBan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const nextValue = typeof req.body.value === "boolean" ? req.body.value : !user.isBanned;
  user.isBanned = nextValue;
  await user.save();
  await recordAuditLog(req, nextValue ? "user_banned" : "user_unbanned", user._id, {
    value: nextValue,
  });

  return res.status(200).json({ message: `User ${nextValue ? "banned" : "unbanned"} successfully` });
});

const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const nextValue = typeof req.body.value === "boolean" ? req.body.value : true;
  user.isVerified = nextValue;
  await user.save();
  await recordAuditLog(req, nextValue ? "user_verified" : "user_unverified", user._id, {
    value: nextValue,
  });

  return res.status(200).json({ message: `User ${nextValue ? "verified" : "unverified"} successfully` });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    throw new ApiError(400, "Admins cannot delete their own account from this endpoint");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "Delete the only admin through a controlled migration flow instead");
  }

  await Promise.all([
    User.findByIdAndDelete(req.params.id),
    SkillListing.deleteMany({ userId: req.params.id }),
    Exchange.deleteMany({
      $or: [{ userA: req.params.id }, { userB: req.params.id }],
    }),
    Review.deleteMany({
      $or: [{ fromUser: req.params.id }, { toUser: req.params.id }],
    }),
    Report.deleteMany({ reportedBy: req.params.id }),
  ]);

  await recordAuditLog(req, "user_deleted", req.params.id, {
    email: user.email,
    userId: user.userId,
  });

  return res.status(200).json({ message: "User deleted successfully" });
});

const getAllListings = asyncHandler(async (req, res) => {
  const listings = await SkillListing.find()
    .populate("userId", "name userId email")
    .sort({ createdAt: -1 });

  return res.status(200).json(listings);
});

const removeListing = asyncHandler(async (req, res) => {
  const listing = await SkillListing.findById(req.params.id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  listing.status = "removed";
  await listing.save();
  await recordAuditLog(req, "listing_removed", listing._id);
  return res.status(200).json({ message: "Listing removed" });
});

const getAllExchanges = asyncHandler(async (req, res) => {
  const exchanges = await Exchange.find()
    .populate("userA", "name userId email")
    .populate("userB", "name userId email")
    .sort({ createdAt: -1 });

  return res.status(200).json(exchanges);
});

const cancelExchange = asyncHandler(async (req, res) => {
  const exchange = await Exchange.findById(req.params.id);
  if (!exchange) {
    throw new ApiError(404, "Exchange not found");
  }

  exchange.status = "cancelled";
  await exchange.save();
  await recordAuditLog(req, "exchange_cancelled", exchange._id);
  return res.status(200).json({ message: "Exchange cancelled" });
});

const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("reportedBy", "name userId email")
    .sort({ createdAt: -1 });

  return res.status(200).json(reports);
});

const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  report.status = "resolved";
  await report.save();
  await recordAuditLog(req, "report_resolved", report._id);
  return res.status(200).json({ message: "Report resolved" });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await recalculateUserRating(review.toUser);
  await recordAuditLog(req, "review_deleted", req.params.id);
  return res.status(200).json({ message: "Review deleted" });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalListings, totalExchanges, userGrowth, listingGrowth, exchangeGrowth, skillCategories] =
    await Promise.all([
      User.countDocuments(),
      SkillListing.countDocuments({ status: "active" }),
      Exchange.countDocuments(),
      getRecentGrowth(User),
      getRecentGrowth(SkillListing, { status: "active" }),
      getRecentGrowth(Exchange),
      getSkillCategoryBreakdown(),
    ]);

  return res.status(200).json({
    totalUsers,
    totalListings,
    totalExchanges,
    skillCategories,
    growth: {
      users: userGrowth,
      listings: listingGrowth,
      exchanges: exchangeGrowth,
    },
  });
});

module.exports = {
  getAllUsers,
  getDashboard,
  toggleUserBan,
  verifyUser,
  deleteUser,
  getAllListings,
  removeListing,
  getAllExchanges,
  cancelExchange,
  getAllReports,
  resolveReport,
  deleteReview,
  getAnalytics,
};
