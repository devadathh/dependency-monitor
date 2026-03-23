import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";
import "../../styles/dark-mode.css";

function OTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleVerify = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-register-otp",
        { email, otp }
      );

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
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

      <div className="auth-card" style={{ textAlign: "center" }}>
      <h2>OTP Verification</h2>
      <input
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
        style={{ padding: "10px", margin: "10px 0" }}
      />
      <br /><br />
      <button className="auth-button" onClick={handleVerify}>Verify</button>
      </div>
    </div>
  );
}

export default OTP;
