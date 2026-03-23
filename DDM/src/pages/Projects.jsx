import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/projects.css";
import {
  FolderGit2,
  Package,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDependencies: 0,
    totalVulnerabilities: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [dashboardRes, projectsRes] = await Promise.all([
          fetch("http://localhost:5000/api/projects/dashboard", { headers }),
          fetch("http://localhost:5000/api/projects", { headers })
        ]);

        if (!dashboardRes.ok || !projectsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const dashboardData = await dashboardRes.json();
        const projectsData = await projectsRes.json();

        setStats(dashboardData);
        setProjects(projectsData);
      } catch (err) {
        console.error(err);
        setError("Error loading projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatus = (vuls) => {
    if (vuls === 0) return { label: "SAFE", class: "safe", icon: "✔" };
    if (vuls < 3) return { label: "WARNING", class: "warning", icon: "⚠" };
    return { label: "CRITICAL", class: "critical", icon: "⚠" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="page-wrapper"><p>Loading...</p></div>;
  if (error) return <div className="page-wrapper"><p className="error-message">{error}</p></div>;

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and monitor your software projects</p>
        </div>

        <Link to="/projects/new">
          <button className="primary-btn">
            + New Project
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
  <div className="projects-stats">

  <div className="stat-card">
    <div className="stat-content">
    <div className="stat-icon green-bg">
      <Package size={20} />
    </div>
    <div className="stat-text">
      <div className="stat-title">Total Projects</div>
      <div className="stat-number">{stats.totalProjects}</div>
    </div>
  </div>
</div>
  <div className="stat-card">
    <div className="stat-content">
    <div className="stat-icon orange-bg">
      <TrendingUp size={20} />
    </div>
    <div className="stat-text">
      <div className="stat-title">Active Vulnerabilities</div>
      <div className={`stat-number ${stats.totalVulnerabilities > 0 ? 'red' : 'green'}`}>
        {stats.totalVulnerabilities}
      </div>
    </div>
    </div>
  </div>

  <div className="stat-card">
      <div className="stat-content">
    <div className="stat-icon red-bg">
      <AlertTriangle size={20} />
    </div>
    <div className="stat-text">
      <div className="stat-title">Total Dependencies</div>
      <div className="stat-number">{stats.totalDependencies}</div>
    </div>
  </div>
  </div>

</div>

      {/* Project Grid */}
      <div className="project-grid">
        {projects.length === 0 ? (
          <p>No projects found. Create one to get started!</p>
        ) : (
          projects.map((project) => {
            const status = getStatus(parseInt(project.total_vulnerabilities));
            return (
              <Link to={`/projects/${project.project_id}`} key={project.project_id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`project-card ${status.class}`}>
                  <div className="project-header">
                    <div>
                      <h3>{project.project_name}</h3>
                    </div>
                    <span className={`alert-icon ${status.class === 'safe' ? 'green' : ''}`}>{status.icon}</span>
                  </div>

                  <p>{project.description || "No description provided"}</p>

                  <div className="project-stats">
                    <div>
                      <span>Dependencies</span>
                      <strong>{project.total_dependencies}</strong>
                    </div>
                    <div>
                      <span>Vulnerabilities</span>
                      <strong className={parseInt(project.total_vulnerabilities) > 0 ? "red" : "green"}>
                        {project.total_vulnerabilities}
                      </strong>
                    </div>
                  </div>

                  <div className="project-footer">
                    <span>Scanned {formatDate(project.last_scanned)}</span>
                    <span className={`status-badge ${status.class}`}>{status.label}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

    </div>
  );
}

export default Projects;
