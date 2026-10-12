const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
CLIENT_ID='932871045999-ev36gqafk841g4hamt3hvilv7hhtquh2.apps.googleusercontent.com';
const googleClient = new OAuth2Client(
  process.env.CLIENT_ID
);

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    // Verify Google's ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email || !payload.email_verified) {
      return res.status(401).json({
        message: "Verified Google email required",
      });
    }

    // Find an existing account by Google ID or email
    let user = await User.findOne({
      $or: [
        { googleId: payload.sub },
        { email: payload.email },
      ],
    });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email,
        email: payload.email,
        googleId: payload.sub,
        role: "user",
      });
    } else if (
      user.googleId &&
      user.googleId !== payload.sub
    ) {
      return res.status(409).json({
        message: "Google account does not match this user",
      });
    } else if (!user.googleId) {
      // Do not silently link Google to an existing
      // password account. Require an account-linking flow.
      return res.status(409).json({
        message: "Account exists. Sign in normally and link Google securely.",
      });
    }

    // Issue your application's JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "15m"
    }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


async function linkGoogleAccount(req, res) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required."
            });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.CLIENT_ID
        });

        const googleUser = ticket.getPayload();

        if (!googleUser || !googleUser.email_verified) {
            return res.status(401).json({
                message: "Google account verification failed."
            });
        }

        // Identify the already-authenticated application user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Do not link a Google identity already owned by another account
        const existingGoogleUser = await User.findOne({
            googleId: googleUser.sub
        });

        if (
            existingGoogleUser &&
            existingGoogleUser._id.toString() !== user._id.toString()
        ) {
            return res.status(409).json({
                message: "This Google account is linked to another user."
            });
        }

        // Do not silently replace an existing Google identity
        if (user.googleId && user.googleId !== googleUser.sub) {
            return res.status(409).json({
                message: "A different Google account is already linked."
            });
        }

        // Require the Google account email to match this app account.
        // For linking a different email, use a separate, explicit policy.
        if (
            user.email.toLowerCase() !==
            googleUser.email.toLowerCase()
        ) {
            return res.status(400).json({
                message: "Google email does not match your account email."
            });
        }

        if (!user.name && googleUser.name) {
    user.name = googleUser.name;
}

        user.googleId = googleUser.sub;
        await user.save();

        return res.status(200).json({
            message: "Google account linked successfully."
        });
    } catch (error) {
        console.error("Google account linking failed:", error.message);

        return res.status(401).json({
            message: "Unable to verify or link Google account."
        });
    }
}

module.exports = { googleLogin, linkGoogleAccount };
