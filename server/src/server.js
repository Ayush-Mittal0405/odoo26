const path = require("path");

// Load .env BEFORE anything else touches process.env
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

console.log("✅ DATABASE_URL loaded:", !!process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const environmentalRoutes = require("./routes/environmentalRoutes");
const socialRoutes = require("./routes/socialRoutes");
const governanceRoutes = require("./routes/governanceRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

/*
=====================
Middlewares
=====================
*/

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
=====================
Routes
=====================
*/

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/environmental", environmentalRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "EcoSphere API Running 🚀",
  });
});

/*
=====================
Start Server
=====================
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});