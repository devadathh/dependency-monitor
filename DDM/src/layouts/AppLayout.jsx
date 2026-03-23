import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/layout.css";
import "../styles/dark-mode.css"; // Global theme file
import Chatbot from "../components/Chatbot";

function AppLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Theme settings
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Apply dark mode theme strictly to body so global CSS selectors pick it up
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch projects automatically when the dropdown is opened to stay fresh
  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    axios
      .get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Failed to load projects:", err))
      .finally(() => setLoading(false));
  }, [open]);

  // Close both dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleProjectClick = (projectId) => {
    setOpen(false);
    navigate(`/projects/${projectId}`);
  };

  return (
    <>
      <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">DDM</div>

        <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
        <NavLink to="/projects" className="nav-item">Projects</NavLink>
        <NavLink to="/dependencies" className="nav-item">Dependencies</NavLink>
        <NavLink to="/vulnerabilities" className="nav-item">Vulnerabilities</NavLink>
        <NavLink to="/alerts" className="nav-item">Alerts</NavLink>
        <NavLink to="/settings" className="nav-item">Settings</NavLink>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">

          {/* ── Project Dropdown ── */}
          <div className="project-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="project-dropdown-btn"
              onClick={() => setOpen((prev) => !prev)}
            >
              All Projects
              <span className={`dropdown-arrow ${open ? "open" : ""}`}>▾</span>
            </button>

            {open && (
              <div className="project-dropdown-menu">
                {loading && (
                  <div className="dropdown-item muted">Loading...</div>
                )}

                {!loading && projects.length === 0 && (
                  <div className="dropdown-item muted">No projects found</div>
                )}

                {!loading && projects.map((p) => (
                  <button
                    key={p.project_id}
                    className="dropdown-item"
                    onClick={() => handleProjectClick(p.project_id)}
                  >
                    <span className="dropdown-item-name">{p.project_name}</span>
                    {p.total_vulnerabilities > 0 ? (
                      <span className="dropdown-badge danger">
                        {p.total_vulnerabilities} vuln
                      </span>
                    ) : (
                      <span className="dropdown-badge safe">Safe</span>
                    )}
                  </button>
                ))}

                <div className="dropdown-divider" />
                <button
                  className="dropdown-item view-all"
                  onClick={() => { setOpen(false); navigate("/projects"); }}
                >
                  View all projects →
                </button>
              </div>
            )}
          </div>

          <div className="top-icons">
            {/* ── Theme Toggle ── */}
            <button
              className="theme-toggle-btn"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* ── Profile Dropdown ── */}
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                className="profile-icon-btn"
                onClick={() => setProfileOpen((p) => !p)}
                title="Account"
              >
                👤
              </button>

              {profileOpen && (
                <div className="profile-dropdown-menu">
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
    <Chatbot />
    </>
  );
}

export default AppLayout;
