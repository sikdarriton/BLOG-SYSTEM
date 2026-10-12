const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  refresh,
  logout,
  getLoggedInUser
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  googleLogin,
  linkGoogleAccount
} = require("../controllers/googleAuthController");


const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again later."
  }
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many refresh requests. Please try again later."
  }
});



router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware.protect, getLoggedInUser);

router.post("/google",  googleLogin);

router.post("/google/link", authMiddleware.protect, linkGoogleAccount);

module.exports = router;