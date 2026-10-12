const Post = require("../models/post");
const User = require("../models/user");
const slugify = require("slugify");

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "email role");

    console.log("Retrieved posts:", posts); // Log the retrieved posts for debugging

    if (!posts) {

      throw new AppError(
        "Post not found",
        404,
        "POST_NOT_FOUND"
      );

      // return res.status(404).json({
      //   message: "Post not found",
      // });
    }


    res.status(200).json({
      success: true,
      posts
    });


  } catch (error) {
   next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email");

    if (!post) {

      throw new AppError(
        "Post not found",
        404,
        "POST_NOT_FOUND"
      );

      // return res.status(404).json({
      //   message: "Post not found",
      // });
    }

    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const authorId = req.user.id;
    const user_email = await User.findById(authorId).select("email");

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true
    });

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title,
        content,
        author: user_email,
        timestamps: new Date().toISOString(),
        slug

      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPost) {

    throw new AppError(
                "Post not found",
                404,
                "POST_NOT_FOUND"
            );

      // return res.status(404).json({
      //   success: false,
      //   message: "Post not found",
      // });

    }

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const {
      title,
      content
    } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content are required.",
      });
    }

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true
    });

    const authorId = req.user.id;
    const user_email = await User.findById(authorId).select("email");
    const timestamp = new Date().toISOString();

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: user_email,
      timestamps: timestamp,
      slug: slug
    });
    return res.status(201).json({
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {

    // if (String(req.user.id) === String(req.params.id)) {
    //   return res.status(400).json({
    //     message: "You cannot delete your own account here."
    //   });
    // }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    console.log("Deleted post:", post); // Log the deleted post for debugging

    if (!post) {
          throw new AppError(
                "Post not found",
                404,
                "POST_NOT_FOUND"
            );

      // return res.status(404).json({
      //   message: "Post not found."
      // });
    }

    res.json({
      success: true,
      message: "Post deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      isDeleted: false
    }).populate("author", "name email role");

    if (!post) {


    throw new AppError(
                "Post not found",
                404,
                "POST_NOT_FOUND"
            );


      // return res.status(404).json({
      //   message: "Post not found"
      // });



    }

    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};