const SkillListing = require("../models/SkillListing");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const createListing = asyncHandler(async (req, res) => {
  const listing = await SkillListing.create({
    userId: req.user._id,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    category: req.body.category.trim(),
  });

  const populated = await listing.populate("userId", "name userId avatar rating");
  return res.status(201).json(populated);
});

const getActiveListings = asyncHandler(async (req, res) => {
  const listings = await SkillListing.find({ status: "active" })
    .populate("userId", "name userId avatar rating")
    .sort({ createdAt: -1 });

  return res.status(200).json(listings);
});

const getMyListings = asyncHandler(async (req, res) => {
  const listings = await SkillListing.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(listings);
});

const removeOwnListing = asyncHandler(async (req, res) => {
  const listing = await SkillListing.findById(req.params.id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (String(listing.userId) !== String(req.user._id)) {
    throw new ApiError(403, "You can only remove your own listings");
  }

  listing.status = "removed";
  await listing.save();
  return res.status(200).json({ message: "Listing removed" });
});

module.exports = {
  createListing,
  getActiveListings,
  getMyListings,
  removeOwnListing,
};
