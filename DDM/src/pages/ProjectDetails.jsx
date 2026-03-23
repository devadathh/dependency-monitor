import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch(`http://localhost:5000/api/projects/${id}/details`, { headers });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Project not found");
          throw new Error("Failed to load project details");
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      navigate("/projects");
    } catch (err) {
      console.error(err);
      alert("Error deleting project: " + err.message);
    }
  };

  const getSeverityBadge = (severity) => {
    const sev = severity?.toUpperCase() || "UNKNOWN";
    let colorClass = "safe";

    if (sev === "HIGH") colorClass = "red";
    else if (sev === "CRITICAL") colorClass = "critical";
    else if (sev === "MEDIUM") colorClass = "warning";
    else if (sev === "LOW") colorClass = "safe";

    return <span className={`status-badge ${colorClass}`}>{sev}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="project-details-page"><p>Loading project details...</p></div>;
  if (error) return <div className="project-details-page"><p className="error-message">{error}</p></div>;
  if (!data) return <div className="project-details-page"><p>No data found.</p></div>;

  const { project, dependencies, vulnerabilities } = data;

  return (
    <div className="project-details-page">
      {/* Header Section */}
      <div className="details-header">
        <div>
          <Link to="/projects" className="back-link" style={{ textDecoration: 'none', color: '#6b7280', marginBottom: '10px', display: 'inline-block' }}>← Back to Projects</Link>
          <h1>{project.project_name}</h1>
          <p>{project.description || "No description provided."}</p>
          <div className="project-meta" style={{ marginTop: '10px' }}>
            Last Scanned: {formatDate(project.last_scanned)}
          </div>
        </div>

        <div className="header-actions">
          <button onClick={handleDelete} className="delete-btn">
            Delete Project
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="details-grid">

        {/* Dependencies Section */}
        <div className="details-card">
          <h2>Dependencies <span>({dependencies.length})</span></h2>
          <div className="table-container">
            {dependencies.length === 0 ? (
              <p className="empty-message">No dependencies found.</p>
            ) : (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Dependency Name</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {dependencies.map((dep, index) => (
                    <tr key={index}>
                      <td>{dep.dependency_name}</td>
                      <td>{dep.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Vulnerabilities Section */}
        <div className="details-card">
          <h2>Vulnerabilities <span>({vulnerabilities.length})</span></h2>
          <div className="table-container">
            {vulnerabilities.length === 0 ? (
              <p className="empty-message">No vulnerabilities found! ✅</p>
            ) : (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Dependency</th>
                    <th>Severity</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerabilities.map((vul, index) => (
                    <tr key={index}>
                      <td>{vul.dependency_name}</td>
                      <td>{getSeverityBadge(vul.severity)}</td>
                      <td>{vul.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProjectDetails;
