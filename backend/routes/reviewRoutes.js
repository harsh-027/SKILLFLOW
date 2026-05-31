const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { createReviewValidator, objectIdParam } = require("../validators/platformValidators");
const { createReview, getUserReviews } = require("../controllers/reviewController");

const router = express.Router();

router.get("/user/:id", objectIdParam(), validateRequest, getUserReviews);
router.post("/", authMiddleware, createReviewValidator, validateRequest, createReview);

module.exports = router;
