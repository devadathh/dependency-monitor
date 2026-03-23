const express = require("express");
const cors = require("cors");

require("dotenv").config();
require("./scheduler");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route to check if server runs
app.get("/", (req, res) => res.send("Server is running!"));

app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
}); //checking

// Routes – wrap in try/catch to catch missing files
try {
  const authRoutes = require("./routes/authRoutes");
  const vulnerabilityRoutes = require("./routes/vulnerabilityRoutes");
  const projectRoutes = require("./routes/projectRoutes");
  const alertRoute = require("./routes/alertRoute");
  const dashboardRoutes = require("./routes/dashboardRoutes");
  const chatRoutes = require("./routes/chatRoutes");

  app.use("/api/auth", authRoutes);
  app.use("/api/vulnerability", vulnerabilityRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/vulnerability/alert", alertRoute);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/chat", chatRoutes);
} catch (err) {
  console.error("Error loading routes:", err);
}

// Get port from .env or fallback
const PORT = process.env.PORT || 5000;

// Start server with error handling
app.listen(PORT, (err) => {
  if (err) {
    console.error("Server failed to start:", err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});