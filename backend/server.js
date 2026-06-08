const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiRateLimiter, writeRateLimiter } = require("./middleware/rateLimiters");

dotenv.config();

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured");
}

connectDB();

const app = express();
const clientUrl =
  process.env.CLIENT_URL ||
  process.env.CLIENT_ORIGIN ||
  "https://skillflow-lime.vercel.app";
const allowedOrigins = [
  clientUrl,
  "https://skillflow-lime.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
};

console.log("Auth environment:", {
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  JWT_ACCESS_SECRET: Boolean(process.env.JWT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: Boolean(process.env.JWT_REFRESH_SECRET),
});

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "5mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT || "1mb" }));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
app.disable("x-powered-by");
app.use("/api", apiRateLimiter, writeRateLimiter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Skill Exchange API is running" });
});

app.get("/api/debug/cookies", (req, res) => {
  res.status(200).json({ cookies: req.cookies || {} });
});

const mountApiRoutes = (basePath) => {
  app.use(`${basePath}/public`, require("./routes/publicRoutes"));
  app.use(`${basePath}/auth`, require("./routes/authRoutes"));
  app.use(`${basePath}/users`, require("./routes/userRoutes"));
  app.use(`${basePath}/posts`, require("./routes/postRoutes"));
  app.use(`${basePath}/swap-requests`, require("./routes/swapRoutes"));
  app.use(`${basePath}/swaps`, require("./routes/swapRoutes"));
  app.use(`${basePath}/messages`, require("./routes/messageRoutes"));
  app.use(`${basePath}/listings`, require("./routes/listingRoutes"));
  app.use(`${basePath}/exchanges`, require("./routes/exchangeRoutes"));
  app.use(`${basePath}/reviews`, require("./routes/reviewRoutes"));
  app.use(`${basePath}/reports`, require("./routes/reportRoutes"));
  app.use(`${basePath}/admin`, require("./routes/adminRoutes"));
  app.use(`${basePath}/ai`, require("./routes/ai"));
};

mountApiRoutes("/api/v1");
mountApiRoutes("/api");

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
