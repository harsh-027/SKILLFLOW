const DEFAULT_PROFILE_IMAGE = "/assets/default-profile.png";
const DEFAULT_BANNER_IMAGE = "/assets/default-banner.png";

const sanitizeUser = (user) => {
  const profileImage = user.profileImage || user.avatar || DEFAULT_PROFILE_IMAGE;
  const bannerImage = user.bannerImage || user.banner || DEFAULT_BANNER_IMAGE;

  return ({
  _id: user._id,
  userId: user.userId,
  name: user.name,
  email: user.email,
  role: user.role,
  isBanned: Boolean(user.isBanned),
  isVerified: Boolean(user.isVerified),
  bio: user.bio || "",
  location: user.location || "",
  avatar: user.avatar || profileImage,
  banner: user.banner || bannerImage,
  profileImage,
  bannerImage,
  skillsOffered: Array.isArray(user.skillsOffered) ? user.skillsOffered : [],
  skillsWanted: Array.isArray(user.skillsWanted) ? user.skillsWanted : [],
  interests: Array.isArray(user.interests) ? user.interests : [],
  learningGoals: Array.isArray(user.learningGoals) ? user.learningGoals : [],
  rating: typeof user.rating === "number" ? user.rating : 0,
  followers: Array.isArray(user.followers) ? user.followers : [],
  following: Array.isArray(user.following) ? user.following : [],
  mfaEnabled: Boolean(user.mfaEnabled),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  });
};

module.exports = { DEFAULT_PROFILE_IMAGE, DEFAULT_BANNER_IMAGE, sanitizeUser };
