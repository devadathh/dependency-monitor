const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/sendOTP");

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING user_id",
      [name, email, hashedPassword]
    );

    const userId = newUser.rows[0].user_id;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO otp_verification 
       (user_id, otp_code, purpose, expires_at)
       VALUES ($1,$2,'register', NOW() + INTERVAL '10 minutes')`,
      [userId, otp]
    );

    await sendOTP(email, otp);

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= VERIFY REGISTER OTP =================
exports.verifyRegisterOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user.rows[0].user_id;

    const otpRecord = await pool.query(
      `SELECT * FROM otp_verification 
       WHERE user_id=$1 
       AND otp_code=$2 
       AND purpose='register'
       AND is_used=false
       AND expires_at > NOW()`,
      [userId, otp]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await pool.query(
      "UPDATE users SET is_verified=true WHERE user_id=$1",
      [userId]
    );

    await pool.query(
      "UPDATE otp_verification SET is_used=true WHERE otp_id=$1",
      [otpRecord.rows[0].otp_id]
    );

    const token = jwt.sign(
  { userId, email: user.rows[0].email }, // add email here
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

    res.json({ message: "Verified successfully", token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.rows[0].is_verified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
  { userId: user.rows[0].user_id, email: user.rows[0].email }, // add email here
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user.rows[0].user_id;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO otp_verification 
       (user_id, otp_code, purpose, expires_at)
       VALUES ($1,$2,'reset_password', NOW() + INTERVAL '10 minutes')`,
      [userId, otp]
    );

    await sendOTP(email, otp);

    res.json({ message: "Reset OTP sent successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user.rows[0].user_id;

    const otpRecord = await pool.query(
      `SELECT * FROM otp_verification 
       WHERE user_id=$1 
       AND otp_code=$2 
       AND purpose='reset_password'
       AND is_used=false
       AND expires_at > NOW()`,
      [userId, otp]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash=$1 WHERE user_id=$2",
      [hashedPassword, userId]
    );

    await pool.query(
      "UPDATE otp_verification SET is_used=true WHERE otp_id=$1",
      [otpRecord.rows[0].otp_id]
    );

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, email, email_alerts FROM users WHERE user_id = $1",
      [req.userData.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
         name  = COALESCE($1, name),
         email = COALESCE($2, email)
       WHERE user_id = $3
       RETURNING name, email`,
      [name || null, email || null, req.userData.userId]
    );
    res.json({ message: "Profile updated", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= SAVE NOTIFICATION PREFS =================
exports.saveNotificationPrefs = async (req, res) => {
  const { emailAlerts } = req.body;
  try {
    await pool.query(
      "UPDATE users SET email_alerts = $1 WHERE user_id = $2",
      [emailAlerts === true || emailAlerts === "true", req.userData.userId]
    );
    res.json({ message: "Preferences saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [req.userData.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid)
      return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE user_id = $2",
      [hashed, req.userData.userId]
    );
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
