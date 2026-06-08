const express = require("express");
const {
  createSwapRequest,
  getMySwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  deleteSwapRequest,
} = require("../controllers/swapController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { createSwapRequestValidator, objectIdParam } = require("../validators/platformValidators");

const router = express.Router();

router.post("/", authMiddleware, createSwapRequestValidator, validateRequest, createSwapRequest);
router.get("/", authMiddleware, getMySwapRequests);
router.put("/accept/:id", authMiddleware, objectIdParam(), validateRequest, acceptSwapRequest);
router.put("/reject/:id", authMiddleware, objectIdParam(), validateRequest, rejectSwapRequest);
router.delete("/:id", authMiddleware, objectIdParam(), validateRequest, deleteSwapRequest);

module.exports = router;
