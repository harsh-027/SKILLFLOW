const express = require("express");
const { validateRequest } = require("../middleware/errorHandler");
const { getLandingStats, getSiteReviews, createSiteReview } = require("../controllers/publicController");
const { createSiteReviewValidator } = require("../validators/platformValidators");

const router = express.Router();

router.get("/landing", getLandingStats);
router.get("/site-reviews", getSiteReviews);
router.post("/site-reviews", createSiteReviewValidator, validateRequest, createSiteReview);

module.exports = router;
