
const User = require("../models/user");

// GET /api/users
async function getAllUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("name email role createdAt isDeleted")
      .sort({ createdAt: -1 });

      console.log("Retrieved users:", users); // Log the retrieved users for debugging

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
      .select("name email role createdAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

// PUT /api/users/:id
async function updateUser(req, res, next) {
  try {
    const { name, email, role } = req.body;

    const updates = {};

    if (typeof name === "string") {
      updates.name = name.trim();
    }

    if (typeof email === "string") {
      updates.email = email.trim().toLowerCase();
    }

    if (typeof role === "string") {
      updates.role = role.trim().toLowerCase();
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        message: "Provide a valid name or email or role to update."
      });
    }

    if (
      updates.name !== undefined &&
      !updates.name
    ) {
      return res.status(400).json({
        message: "Name cannot be empty."
      });
    }

    if (
      updates.email !== undefined &&
      !updates.email
    ) {
      return res.status(400).json({
        message: "Email cannot be empty."
      });
    }

    if (
      updates.role !== undefined &&
      !updates.role
    ) {
      return res.status(400).json({
        message: "Role cannot be empty."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("name email role createdAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      success: true,
      message: "User updated successfully.",
      user
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/users/:id
async function deleteUser(req, res, next) {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({
        message: "You cannot delete your own account here."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    console.log("Deleted user:", user); // Log the deleted user for debugging

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};