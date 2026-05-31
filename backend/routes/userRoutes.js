const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateMyProfile,
  followUser,
  unfollowUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.put("/me", authMiddleware, updateMyProfile);
router.get("/:id", getUserById);
router.put("/follow/:id", authMiddleware, followUser);
router.put("/unfollow/:id", authMiddleware, unfollowUser);

module.exports = router;
