const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

dotenv.config();

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured");
}

connectDB();

const app = express();
const defaultClientOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || defaultClientOrigins.join(",")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Skill Exchange API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/swap-requests", require("./routes/swapRoutes"));
app.use("/api/swaps", require("./routes/swapRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/exchanges", require("./routes/exchangeRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/ai"));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
