const express = require("express");
const {
  createSwapRequest,
  getMySwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  deleteSwapRequest,
} = require("../controllers/swapController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createSwapRequest);
router.get("/", authMiddleware, getMySwapRequests);
router.put("/accept/:id", authMiddleware, acceptSwapRequest);
router.put("/reject/:id", authMiddleware, rejectSwapRequest);
router.delete("/:id", authMiddleware, deleteSwapRequest);

module.exports = router;
