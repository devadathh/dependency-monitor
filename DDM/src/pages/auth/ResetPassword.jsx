import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";
import "../../styles/dark-mode.css";

function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Guard: if email is missing (e.g. user refreshed the page), redirect back
  if (!email) {
    return (
      <div className="auth-wrapper" style={{ position: "relative" }}>
        <button
          className="theme-toggle-btn"
          style={{ position: "absolute", top: "20px", right: "20px" }}
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <div className="auth-header">
          <div className="logo-box"><span className="shield-icon">🛡️</span></div>
          <h1>Dependency Monitor</h1>
          <p>Track vulnerabilities and version drift</p>
        </div>
        <div className="auth-card">
          <h2>Session Expired</h2>
          <p className="auth-subtext">
            Your reset session was lost (the page may have been refreshed).
            Please start over.
          </p>
          <button className="auth-button" onClick={() => navigate("/forgot-password")}>
            ← Back to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    setError("");
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email, otp, newPassword }
      );
      alert("Password reset successful");
      navigate("/login");
    } catch (err) {
      // Show the exact server message so user knows what went wrong
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error resetting password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ position: "relative" }}>
      <button
        className="theme-toggle-btn"
        style={{ position: "absolute", top: "20px", right: "20px" }}
        onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <div className="auth-header">
        <div className="logo-box">
          <span className="shield-icon">🛡️</span>
        </div>
        <h1>Dependency Monitor</h1>
        <p>Track vulnerabilities and version drift</p>
      </div>

      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtext">
          Enter the OTP sent to <strong>{email}</strong> and choose a new password.
        </p>

        {/* Inline error — shows exact server message */}
        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="input-group">
          <label>OTP Code</label>
          <div className="input-field">
            <span className="input-icon">🔑</span>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>New Password</label>
          <div className="input-field">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          className="auth-button"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="auth-footer">
          Back to <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
