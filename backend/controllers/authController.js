const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth"
  });
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

function createAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), jti: crypto.randomUUID() },
    REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
  );
}

async function issueSession(user, res) {
  const refreshToken = createRefreshToken(user);
  const decoded = jwt.decode(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000)
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return createAccessToken(user);
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid name, email and password (8–72 characters)."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Never accept the role from public registration input.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user"
    });

    const accessToken = await issueSession(user, res);

    return res.status(201).json({
      message: "Registration successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Registration failed." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    // Use a generic message to avoid revealing whether an email exists.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const accessToken = await issueSession(user, res);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed." });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token required." });
  }

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const tokenHash = hashToken(token);

    // Atomically consume the old session to prevent reuse.
    const session = await RefreshToken.findOneAndDelete({
      userId: payload.sub,
      tokenHash,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      clearRefreshCookie(res);
      return res.status(401).json({
        message: "Refresh session expired or already used. Please log in again."
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Rotate refresh token and issue a new access token.
    const accessToken = await issueSession(user, res);

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({
      message: "Invalid or expired refresh token."
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await RefreshToken.deleteOne({
        tokenHash: hashToken(token)
      });
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      message: "Logout successful."
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(500).json({ message: "Logout failed." });
  }
};


exports.getLoggedInUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};