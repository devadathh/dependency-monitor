/**import { useEffect, useState } from "react";
import "../styles/vulnerabilities.css";

function Vulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/vulnerability/vulnerabilities", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setVulnerabilities(data);
      } catch (err) {
        console.error("Error fetching vulnerabilities:", err);
      }
    };

    fetchVulnerabilities();
  }, []);

  // ✅ Dynamic counts
  const total = vulnerabilities.length;
  const critical = vulnerabilities.filter(v => v.severity === "CRITICAL").length;
  const high = vulnerabilities.filter(v => v.severity === "HIGH").length;
  const medium = vulnerabilities.filter(v => v.severity === "MEDIUM").length;
  const low = vulnerabilities.filter(v => v.severity === "LOW").length;

  return (
    <div className="page-wrapper">
      <h1>Vulnerabilities</h1>

      <div className="vuln-stats">
        <div className="stat-card"><p>Total</p><h2>{total}</h2></div>
        <div className="stat-card"><p>Critical</p><h2 className="red">{critical}</h2></div>
        <div className="stat-card"><p>High</p><h2 className="orange">{high}</h2></div>
        <div className="stat-card"><p>Medium</p><h2 className="yellow">{medium}</h2></div>
        <div className="stat-card"><p>Low</p><h2 className="green">{low}</h2></div>
      </div>

      <div className="vuln-list">
        {vulnerabilities.map(v => (
          <div className="vuln-card" key={v._id}>
            <h3>{v.cveId}</h3>
            <p>{v.packageName}</p>
            <span>{v.severity}</span>
            <p>{v.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vulnerabilities;*/
import { useEffect, useState } from "react";
import "../styles/vulnerabilities.css";

function Vulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/vulnerability/vulnerabilities", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setVulnerabilities(data);
      } catch (err) {
        console.error("Error fetching vulnerabilities:", err);
      }
    };

    fetchVulnerabilities();
  }, []);

  // ✅ Dynamic counts
  const total = vulnerabilities.length;
  const critical = vulnerabilities.filter(v => v.severity === "CRITICAL").length;
  const high = vulnerabilities.filter(v => v.severity === "HIGH").length;
  const moderate = vulnerabilities.filter(v => v.severity === "MODERATE" || v.severity === "MEDIUM").length;
  const low = vulnerabilities.filter(v => v.severity === "LOW").length;

  return (
    <div className="page-wrapper">
      <h1>Vulnerabilities</h1>

      <div className="vuln-stats">
        <div className="stat-card"><p>Total</p><h2>{total}</h2></div>
        <div className="stat-card"><p>Critical</p><h2 className="red">{critical}</h2></div>
        <div className="stat-card"><p>High</p><h2 className="orange">{high}</h2></div>
        <div className="stat-card"><p>Moderate</p><h2 className="yellow">{moderate}</h2></div>
        <div className="stat-card"><p>Low</p><h2 className="green">{low}</h2></div>
      </div>

      {/* ✅ Vulnerability List */}
      <div className="vuln-list">
        {vulnerabilities.map(v => (
          <div className="vuln-card" key={v.dep_vul_id}>
            <h3>{v.cve_id || "No CVE ID"}</h3>
            <p><strong>Dependency:</strong> {v.dependency_name}</p>
            <p><strong>Version:</strong> {v.current_version}</p>
            <span className="severity">{v.severity}</span>
            <p>{v.summary || "No description available"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vulnerabilities;


