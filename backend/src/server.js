import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow one or multiple frontend URLs from CLIENT_URL
// Example:
// CLIENT_URL=http://localhost:5173,https://your-frontend.vercel.app
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Root route for Render base URL
app.get("/", (req, res) => {
  res.json({
    message: "Office Clock-In / Clock-Out Attendance API is running.",
    status: "OK",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend health check successful.",
    status: "OK",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

// 404 route
app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});