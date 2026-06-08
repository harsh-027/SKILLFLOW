const { body, param, query } = require("express-validator");

const objectIdParam = (field = "id") =>
  param(field).isMongoId().withMessage(`${field} must be a valid MongoDB id.`);

const safeImageValue = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return true;
  }

  const trimmed = value.trim();
  const isHttpImage =
    /^https?:\/\/[^\s]+$/i.test(trimmed) &&
    /\.(?:png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(trimmed);
  const isSafeDataImage =
    /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed) &&
    Buffer.byteLength(trimmed, "utf8") <= 2 * 1024 * 1024;

  return isHttpImage || isSafeDataImage;
};

const stringArrayField = (field, maxItems = 25, maxLength = 80) =>
  body(field)
    .optional()
    .isArray({ max: maxItems })
    .withMessage(`${field} must be an array with ${maxItems} or fewer items.`)
    .bail()
    .custom((items) => items.every((item) => typeof item === "string" && item.trim().length <= maxLength))
    .withMessage(`${field} items must be strings ${maxLength} characters or fewer.`);

const createListingValidator = [
  body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Title must be between 3 and 120 characters."),
  body("description")
    .trim()
    .isLength({ min: 20, max: 1500 })
    .withMessage("Description must be between 20 and 1500 characters."),
  body("category").trim().isLength({ min: 2, max: 80 }).withMessage("Category is required."),
];

const createExchangeValidator = [
  body("userB").isMongoId().withMessage("Recipient user is required."),
  body("skillOffered").trim().isLength({ min: 2, max: 120 }).withMessage("skillOffered is required."),
  body("skillRequested").trim().isLength({ min: 2, max: 120 }).withMessage("skillRequested is required."),
];

const createReviewValidator = [
  body("toUser").isMongoId().withMessage("Reviewed user is required."),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
  body("comment").optional().trim().isLength({ max: 600 }).withMessage("Comment must be 600 characters or fewer."),
];

const createSiteReviewValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters."),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
  body("comment").trim().isLength({ min: 10, max: 600 }).withMessage("Review must be between 10 and 600 characters."),
];

const createReportValidator = [
  body("targetType")
    .isIn(["user", "listing", "exchange", "platform"])
    .withMessage("targetType must be user, listing, exchange, or platform."),
  body("targetId")
    .if(body("targetType").not().equals("platform"))
    .isMongoId()
    .withMessage("targetId must be a valid MongoDB id."),
  body("reason").trim().isLength({ min: 10, max: 800 }).withMessage("Reason must be between 10 and 800 characters."),
];

const updateProfileValidator = [
  body("userId")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9._-]{3,24}$/)
    .withMessage("User ID must be 3-24 characters using letters, numbers, dots, underscores, or hyphens."),
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters."),
  body("bio").optional().trim().isLength({ max: 280 }).withMessage("Bio must be 280 characters or fewer."),
  body("location").optional().trim().isLength({ max: 120 }).withMessage("Location must be 120 characters or fewer."),
  body("avatar").optional().custom(safeImageValue).withMessage("Avatar must be a valid image URL or safe image data URL."),
  body("banner").optional().custom(safeImageValue).withMessage("Banner must be a valid image URL or safe image data URL."),
  stringArrayField("skillsOffered"),
  stringArrayField("skillsWanted"),
  stringArrayField("interests"),
  stringArrayField("learningGoals"),
];

const createPostValidator = [
  body("content").optional().trim().isLength({ max: 280 }).withMessage("Post content cannot exceed 280 characters."),
  body("image").optional().custom(safeImageValue).withMessage("Image must be a valid image URL or safe image data URL."),
  body().custom((value) => {
    const content = typeof value.content === "string" ? value.content.trim() : "";
    const image = typeof value.image === "string" ? value.image.trim() : "";
    return Boolean(content || image);
  }).withMessage("Post content or an image is required."),
];

const createCommentValidator = [
  objectIdParam(),
  body("text").trim().isLength({ min: 1, max: 600 }).withMessage("Comment must be between 1 and 600 characters."),
];

const createMessageValidator = [
  body("receiverId").isMongoId().withMessage("receiverId must be a valid MongoDB id."),
  body("content").trim().isLength({ min: 1, max: 2000 }).withMessage("Message must be between 1 and 2000 characters."),
];

const conversationParamValidator = [
  param("userId").isMongoId().withMessage("userId must be a valid MongoDB id."),
];

const createSwapRequestValidator = [
  body("receiverId").isMongoId().withMessage("receiverId must be a valid MongoDB id."),
  body("skillOffered").trim().isLength({ min: 2, max: 120 }).withMessage("skillOffered must be 2-120 characters."),
  body("skillWanted").trim().isLength({ min: 2, max: 120 }).withMessage("skillWanted must be 2-120 characters."),
];

const adminToggleValidator = [
  objectIdParam(),
  body("value").optional().isBoolean().withMessage("value must be a boolean."),
];

const createLearningPathValidator = [
  body("targetSkill")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("targetSkill must be between 2 and 120 characters."),
];

const recommendedSkillsValidator = [
  query("skill")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("skill must be between 2 and 120 characters."),
];

module.exports = {
  objectIdParam,
  createListingValidator,
  createExchangeValidator,
  createReviewValidator,
  createSiteReviewValidator,
  createReportValidator,
  updateProfileValidator,
  createPostValidator,
  createCommentValidator,
  createMessageValidator,
  conversationParamValidator,
  createSwapRequestValidator,
  adminToggleValidator,
  createLearningPathValidator,
  recommendedSkillsValidator,
};
