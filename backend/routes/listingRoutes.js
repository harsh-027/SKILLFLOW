const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { createListingValidator, objectIdParam } = require("../validators/platformValidators");
const {
  createListing,
  getActiveListings,
  getMyListings,
  removeOwnListing,
} = require("../controllers/listingController");

const router = express.Router();

router.get("/", getActiveListings);
router.get("/mine", authMiddleware, getMyListings);
router.post("/", authMiddleware, createListingValidator, validateRequest, createListing);
router.delete("/:id", authMiddleware, objectIdParam(), validateRequest, removeOwnListing);

module.exports = router;
