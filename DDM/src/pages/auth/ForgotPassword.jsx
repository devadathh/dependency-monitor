import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";
import "../../styles/dark-mode.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleForgot = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      alert("OTP sent to email");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
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
        <h2>Forgot Password</h2>
        <p className="auth-subtext">
          Enter your email and we'll send you an OTP to reset your password.
        </p>

        <div className="input-group">
          <label>Email address</label>
          <div className="input-field">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          className="auth-button"
          onClick={handleForgot}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <div className="auth-footer">
          Remembered your password?{" "}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
