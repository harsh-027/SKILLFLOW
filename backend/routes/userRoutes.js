const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateMyProfile,
  followUser,
  unfollowUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { objectIdParam, updateProfileValidator } = require("../validators/platformValidators");

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.put("/me", authMiddleware, updateProfileValidator, validateRequest, updateMyProfile);
router.get("/:id", objectIdParam(), validateRequest, getUserById);
router.put("/follow/:id", authMiddleware, objectIdParam(), validateRequest, followUser);
router.put("/unfollow/:id", authMiddleware, objectIdParam(), validateRequest, unfollowUser);

module.exports = router;
