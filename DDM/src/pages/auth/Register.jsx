import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/auth.css";
import "../../styles/dark-mode.css";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: "User", // since no name field in UI
          email,
          password
        }
      );

      alert(res.data.message);

      navigate("/otp", { state: { email } });

    } catch (err) {
      alert(err.response?.data?.message || "Error");
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
        <p>Start monitoring your dependencies today</p>
      </div>

      <div className="auth-card">
        <h2>Create your account</h2>

        <div className="input-group">
          <label>Email address</label>
          <div className="input-field">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-field">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Confirm password</label>
          <div className="input-field">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="auth-button" onClick={handleRegister}>
          Create account
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
