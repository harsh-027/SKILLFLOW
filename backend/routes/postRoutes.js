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
const { validateRequest } = require("../middleware/errorHandler");
const {
  createCommentValidator,
  createPostValidator,
  objectIdParam,
} = require("../validators/platformValidators");

const router = express.Router();

router.post("/", authMiddleware, createPostValidator, validateRequest, createPost);
router.get("/", authMiddleware, getAllPosts);
router.get("/feed", authMiddleware, getCommunityPosts);
router.get("/following", authMiddleware, getFollowingPosts);
router.put("/like/:id", authMiddleware, objectIdParam(), validateRequest, toggleLikePost);
router.post("/comment/:id", authMiddleware, createCommentValidator, validateRequest, addCommentToPost);
router.delete("/:id", authMiddleware, objectIdParam(), validateRequest, deletePost);

module.exports = router;
