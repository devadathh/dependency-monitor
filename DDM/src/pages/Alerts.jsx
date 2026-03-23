import { useState, useEffect } from "react";
import { fetchAlerts, resolveAlert } from "../services/alertService";
import "../styles/alerts.css";

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `Just now`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Alerts");
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load alerts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (type, id) => {
    try {
      setResolvingId(id);
      await resolveAlert(type, id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a))
      );
    } catch (error) {
      console.error("Failed to resolve alert", error);
    } finally {
      setResolvingId(null);
    }
  };

  const total = alerts.length;
  const openCount = alerts.filter((a) => !a.isResolved).length;
  const resolvedCount = alerts.filter((a) => a.isResolved).length;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "Open") return !a.isResolved;
    if (filter === "Resolved") return a.isResolved;
    return true; // "All Alerts"
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>Monitor and manage security alerts</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="alerts-stats">
        <div className="stat-card">
          <p>Total Alerts</p>
          <h2>{loading ? "-" : total}</h2>
        </div>
        <div className="stat-card">
          <p>Open</p>
          <h2 className="orange">{loading ? "-" : openCount}</h2>
        </div>
        <div className="stat-card">
          <p>Resolved</p>
          <h2 className="green">{loading ? "-" : resolvedCount}</h2>
        </div>
      </div>

      {/* Filter */}
      <div className="alerts-filter">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All Alerts</option>
          <option>Open</option>
          <option>Resolved</option>
        </select>
      </div>

      {/* Alert Cards */}
      <div className="alerts-list">
        {loading ? (
          <p className="loading-text">Loading alerts...</p>
        ) : filteredAlerts.length === 0 ? (
          <p className="empty-text">No alerts found for this filter.</p>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${alert.isResolved ? "resolved" : "open"}`}
            >
              <div className="alert-header">
                <div>
                  <h3>{alert.title}</h3>
                  <p>{alert.targetDetails}</p>
                </div>
                <span
                  className={`badge ${alert.isResolved ? "success" : ""}`}
                >
                  {alert.isResolved ? "RESOLVED" : "OPEN"}
                </span>
              </div>

              <p className="alert-description">{alert.description}</p>

              <div className="alert-footer">
                <span>{timeAgo(alert.createdAt)}</span>
                {!alert.isResolved && (
                  <button
                    className="resolve-btn"
                    onClick={() => handleResolve(alert.type, alert.id)}
                    disabled={resolvingId === alert.id}
                  >
                    {resolvingId === alert.id ? "Resolving..." : "Resolve"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Alerts;
