const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", auth.register);
router.post("/verify-register-otp", auth.verifyRegisterOTP);
router.post("/login", auth.login);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

// Protected profile routes
router.get("/profile", authMiddleware, auth.getProfile);
router.patch("/profile", authMiddleware, auth.updateProfile);
router.patch("/change-password", authMiddleware, auth.changePassword);
router.patch("/notifications", authMiddleware, auth.saveNotificationPrefs);

module.exports = router;
