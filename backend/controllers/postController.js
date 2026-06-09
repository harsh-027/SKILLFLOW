const Post = require("../models/Post");
const User = require("../models/User");

const visibleUserFields = "name userId email avatar profileImage";

const stripInactiveCommunityContent = (posts) =>
  posts
    .map((post) => (typeof post.toObject === "function" ? post.toObject() : post))
    .filter((post) => post.user)
    .map((post) => ({
      ...post,
      comments: Array.isArray(post.comments)
        ? post.comments.filter((comment) => comment.user)
        : [],
    }));

const cleanupDeletedCommunityReferences = async () => {
  const posts = await Post.find({})
    .select("user likes comments.user")
    .lean();

  const referencedUserIds = new Set();
  posts.forEach((post) => {
    if (post.user) {
      referencedUserIds.add(String(post.user));
    }

    (post.likes || []).forEach((userId) => referencedUserIds.add(String(userId)));
    (post.comments || []).forEach((comment) => {
      if (comment.user) {
        referencedUserIds.add(String(comment.user));
      }
    });
  });

  if (!referencedUserIds.size) {
    return;
  }

  const referencedIds = Array.from(referencedUserIds);
  const existingIds = await User.find({ _id: { $in: referencedIds } }).distinct("_id");
  const existingIdSet = new Set(existingIds.map((id) => String(id)));
  const deletedIds = referencedIds.filter((id) => !existingIdSet.has(id));

  if (!deletedIds.length) {
    return;
  }

  await Promise.all([
    Post.deleteMany({ user: { $in: deletedIds } }),
    Post.updateMany(
      {},
      {
        $pull: {
          comments: { user: { $in: deletedIds } },
          likes: { $in: deletedIds },
        },
      }
    ),
    User.updateMany(
      {},
      {
        $pull: {
          followers: { $in: deletedIds },
          following: { $in: deletedIds },
        },
      }
    ),
  ]);
};

const createPost = async (req, res) => {
  try {
    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";
    const image =
      typeof req.body.image === "string" ? req.body.image.trim() : "";

    if (!content && !image) {
      return res
        .status(400)
        .json({ message: "Post content or an image is required" });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: "Post content cannot exceed 280 characters" });
    }

    const post = await Post.create({
      user: req.user.id,
      ...(content ? { content } : {}),
      ...(image ? { image } : {}),
    });

    const populatedPost = await post.populate("user", visibleUserFields);
    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", visibleUserFields)
      .populate({
        path: "comments.user",
        select: "name userId avatar profileImage",
        match: { isBanned: false },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(stripInactiveCommunityContent(posts));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("following");
    if (!currentUser) {
  return res.status(404).json({ message: "User not found" });
}
    const followingIds = currentUser.following;

    const posts = await Post.find({ user: { $in: followingIds } })
      .populate({
        path: "user",
        select: visibleUserFields,
        match: { isBanned: false },
      })
      .populate({
        path: "comments.user",
        select: "name userId avatar profileImage",
        match: { isBanned: false },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(stripInactiveCommunityContent(posts));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch following feed", error: error.message });
  }
};

const getCommunityPosts = async (req, res) => {
  try {
    await cleanupDeletedCommunityReferences();

    const posts = await Post.find({})
      .populate({
        path: "user",
        select: visibleUserFields,
        match: { isBanned: false },
      })
      .populate({
        path: "comments.user",
        select: "name userId avatar profileImage",
        match: { isBanned: false },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(stripInactiveCommunityContent(posts));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch community feed", error: error.message });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    return res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle like", error: error.message });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate({
        path: "user",
        select: visibleUserFields,
        match: { isBanned: false },
      })
      .populate({
        path: "comments.user",
        select: "name userId avatar profileImage",
        match: { isBanned: false },
      });

    return res.status(201).json(stripInactiveCommunityContent([updatedPost])[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Post deleted permanently" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getFollowingPosts,
  getCommunityPosts,
  toggleLikePost,
  addCommentToPost,
  deletePost,
};
