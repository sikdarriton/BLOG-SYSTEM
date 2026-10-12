require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/admin/posts", require("./routes/postRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

app.use(notFound);
app.use(errorHandler);

// Example protected route can be registered here as well.

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (
      !process.env.MONGO_URI ||
      !process.env.ACCESS_TOKEN_SECRET ||
      !process.env.REFRESH_TOKEN_SECRET
    ) {
      throw new Error("Required environment variables are missing.");
    }

    if (
      process.env.ACCESS_TOKEN_SECRET ===
      process.env.REFRESH_TOKEN_SECRET
    ) {
      throw new Error("Use different secrets for access and refresh tokens.");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();