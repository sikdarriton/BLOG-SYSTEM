const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");


router.get("/", authMiddleware.protect, getAllUsers);
router.get("/:id", authMiddleware.protect, getUserById);
router.put("/:id", authMiddleware.protect, authMiddleware.adminOnly, updateUser);
router.delete("/:id", authMiddleware.protect, authMiddleware.adminOnly, deleteUser);

module.exports = router;