const Post = require("../models/Post");

const authorizePostOwnerOrAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Admin can edit any post
    if (req.user.role === "admin") {
      req.post = post;
      return next();
    }

    /*
    console.log("Post author ID:", post.author.toString());
    console.log("Current user ID:", req.user.id.toString());
    console.log("Current user role:", req.user.role);
    */

    // Regular user can edit only their own post
    if (post.author.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this post",
      });
    }

    req.post = post;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authorizePostOwnerOrAdmin };