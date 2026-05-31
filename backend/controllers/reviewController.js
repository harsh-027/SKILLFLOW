const Review = require("../models/Review");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const recalculateRating = async (userId) => {
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

const createReview = asyncHandler(async (req, res) => {
  if (req.body.toUser === String(req.user._id)) {
    throw new ApiError(400, "You cannot review yourself");
  }

  const review = await Review.findOneAndUpdate(
    { fromUser: req.user._id, toUser: req.body.toUser },
    {
      fromUser: req.user._id,
      toUser: req.body.toUser,
      rating: req.body.rating,
      comment: typeof req.body.comment === "string" ? req.body.comment.trim() : "",
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .populate("fromUser", "name userId avatar")
    .populate("toUser", "name userId avatar");

  await recalculateRating(req.body.toUser);
  return res.status(201).json(review);
});

const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ toUser: req.params.id })
    .populate("fromUser", "name userId avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(reviews);
});

module.exports = {
  createReview,
  getUserReviews,
};
