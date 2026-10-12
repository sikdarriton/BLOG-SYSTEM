
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Post = require("../models/post");

// GET dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({
            isDeleted: { $ne: true }
        });

        const totalPosts = await Post.countDocuments({
            isDeleted: { $ne: true }
        });

        res.status(200).json({
            success: true,
            totalUsers,
            totalPosts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
});

module.exports = router;
