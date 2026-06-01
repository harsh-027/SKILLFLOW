const LearningPath = require("../models/LearningPath");
const Post = require("../models/Post");
const SkillListing = require("../models/SkillListing");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const compactNumber = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const getLandingStats = asyncHandler(async (req, res) => {
  const [builderCount, listingCount, swapCount, pathCount, postCount, skillBuckets] = await Promise.all([
    User.countDocuments({ isBanned: false }),
    SkillListing.countDocuments({ status: "active" }),
    SwapRequest.countDocuments({}),
    LearningPath.countDocuments({}),
    Post.countDocuments({}),
    User.aggregate([
      { $match: { isBanned: false } },
      {
        $project: {
          skills: {
            $setUnion: [
              { $ifNull: ["$skillsOffered", []] },
              { $ifNull: ["$skillsWanted", []] },
            ],
          },
        },
      },
      { $unwind: "$skills" },
      {
        $group: {
          _id: {
            $toLower: {
              $trim: { input: "$skills" },
            },
          },
        },
      },
      { $match: { _id: { $ne: "" } } },
      { $count: "total" },
    ]),
  ]);

  const uniqueSkillCount = skillBuckets[0]?.total || listingCount;

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    stats: {
      builders: builderCount,
      skills: uniqueSkillCount,
      swaps: swapCount,
      paths: pathCount,
      posts: postCount,
    },
    displayStats: [
      { label: "Builders", value: compactNumber(builderCount) },
      { label: "Skills", value: compactNumber(uniqueSkillCount) },
      { label: "Swaps", value: compactNumber(swapCount) },
    ],
  });
});

module.exports = { getLandingStats };
