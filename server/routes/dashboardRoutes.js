const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// All dashboard routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/stats
router.get("/stats", dashboardController.getStats);

// GET /api/dashboard/trends
router.get("/trends", dashboardController.getTrends);

module.exports = router;
