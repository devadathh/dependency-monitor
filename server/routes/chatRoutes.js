const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { chat } = require("../controllers/chatController");

// POST /api/chat
router.post("/", authMiddleware, chat);

module.exports = router;
