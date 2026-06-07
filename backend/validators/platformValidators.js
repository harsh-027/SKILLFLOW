const { body, param, query } = require("express-validator");

const objectIdParam = (field = "id") =>
  param(field).isMongoId().withMessage(`${field} must be a valid MongoDB id.`);

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
    .isIn(["user", "listing", "exchange"])
    .withMessage("targetType must be user, listing, or exchange."),
  body("targetId").isMongoId().withMessage("targetId must be a valid MongoDB id."),
  body("reason").trim().isLength({ min: 10, max: 800 }).withMessage("Reason must be between 10 and 800 characters."),
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
  adminToggleValidator,
  createLearningPathValidator,
  recommendedSkillsValidator,
};
