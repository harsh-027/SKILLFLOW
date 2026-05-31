const express = require("express");
const {
  createPost,
  getAllPosts,
  getFollowingPosts,
  getCommunityPosts,
  toggleLikePost,
  addCommentToPost,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getAllPosts);
router.get("/feed", authMiddleware, getCommunityPosts);
router.get("/following", authMiddleware, getFollowingPosts);
router.put("/like/:id", authMiddleware, toggleLikePost);
router.post("/comment/:id", authMiddleware, addCommentToPost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
