const express = require("express");
const router = express.Router();

const validatePost = require("../middleware/validatePost");

const {
  getAllPosts, getPostById, updatePost, createPost, deletePost, getPostBySlug
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  authorizePostOwnerOrAdmin,
} = require("../middleware/postAccessMiddleware");


router.get("/", authMiddleware.protect, getAllPosts);
router.get("/:id", authMiddleware.protect, getPostById);
router.put("/:id", authMiddleware.protect, authorizePostOwnerOrAdmin, validatePost, updatePost);
router.post("/", authMiddleware.protect, validatePost, createPost);
router.delete("/:id", authMiddleware.protect, authorizePostOwnerOrAdmin, deletePost);
router.get("/slug/:slug", validatePost, getPostBySlug);
module.exports = router;