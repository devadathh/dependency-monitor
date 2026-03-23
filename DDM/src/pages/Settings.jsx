import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/settings.css";

const API = "http://localhost:5000/api/auth";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function Settings() {
  // ── Profile state ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState(null); // {type, text}
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  // ── Notification state (persisted to localStorage) ──
  const [emailAlerts, setEmailAlerts] = useState(
    () => localStorage.getItem("pref_emailAlerts") !== "false"
  );

  useEffect(() => {
    axios
      .get(`${API}/profile`, { headers: authHeaders() })
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        // Sync email_alerts from DB (authoritative)
        if (res.data.email_alerts !== undefined) {
          setEmailAlerts(res.data.email_alerts);
          localStorage.setItem("pref_emailAlerts", res.data.email_alerts);
        }
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);

  // ── Save Profile ──
  const handleSaveProfile = async () => {
    setProfileMsg(null);
    try {
      setProfileLoading(true);
      await axios.patch(
        `${API}/profile`,
        { name, email },
        { headers: authHeaders() }
      );
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update profile";
      setProfileMsg({ type: "error", text: msg });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change Password ──
  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    try {
      setPwLoading(true);
      await axios.patch(
        `${API}/change-password`,
        { currentPassword, newPassword },
        { headers: authHeaders() }
      );
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to change password";
      setPwMsg({ type: "error", text: msg });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and application preferences</p>
        </div>
      </div>

      {/* ── Profile Settings ── */}
      <div className="settings-card">
        <h2>Profile Settings</h2>

        {profileMsg && (
          <div className={profileMsg.type === "success" ? "settings-success" : "settings-error"}>
            {profileMsg.text}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={handleSaveProfile}
          disabled={profileLoading}
        >
          {profileLoading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* ── Change Password ── */}
      <div className="settings-card">
        <h2>Change Password</h2>

        {pwMsg && (
          <div className={pwMsg.type === "success" ? "settings-success" : "settings-error"}>
            {pwMsg.text}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={handleChangePassword}
          disabled={pwLoading}
        >
          {pwLoading ? "Updating..." : "Change Password"}
        </button>
      </div>

      {/* ── Notification Preferences ── */}
      <div className="settings-card">
        <h2>Notification Preferences</h2>

        <div className="toggle-row">
          <div>
            <h4>Email Alerts</h4>
            <p>Receive email notifications for critical vulnerabilities</p>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={async (e) => {
              const val = e.target.checked;
              setEmailAlerts(val);
              localStorage.setItem("pref_emailAlerts", val);
              // Persist to backend so email sending is gated
              try {
                await axios.patch(
                  `${API}/notifications`,
                  { emailAlerts: val },
                  { headers: authHeaders() }
                );
              } catch (err) {
                console.error("Failed to save notification pref:", err);
              }
            }}
          />
        </div>
      </div>

    </div>
  );
}

export default Settings;
