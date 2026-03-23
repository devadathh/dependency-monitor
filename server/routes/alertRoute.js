const express = require("express");
const router = express.Router();
const { sendAlertEmail } = require("../utils/emailsend");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const alertController = require("../controllers/alertController");

// GET /api/alerts — Fetch all user alerts (vulnerabilities and drift)
router.get("/", authMiddleware, alertController.getAlerts);

// PATCH /api/alerts/:type/:id/resolve — Mark an alert as resolved
router.patch("/:type/:id/resolve", authMiddleware, alertController.resolveAlert);

// POST /api/alerts — send alert email (respects email_alerts preference)
router.post("/", authMiddleware, async (req, res) => {
  const { userEmail, vulnerabilityDetails } = req.body;

  if (!userEmail || !vulnerabilityDetails) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Check user email preference before sending
  const prefResult = await pool.query(
    "SELECT email_alerts FROM users WHERE user_id = $1",
    [req.userData.userId]
  );
  const emailAlertsEnabled = prefResult.rows[0]?.email_alerts !== false;

  if (!emailAlertsEnabled) {
    return res.json({ message: "Email alerts are disabled by user preference" });
  }

  const subject = "⚠️ Vulnerability Alert Detected!";
  const text = `Dear User,\n\nA new vulnerability has been detected:\n${vulnerabilityDetails}\n\nPlease take immediate action.`;

  await sendAlertEmail(userEmail, subject, text);
  res.json({ message: "Alert email sent successfully!" });
});

module.exports = router;