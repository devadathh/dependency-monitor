const pool = require("../db");

// GET /api/alerts
// Fetches all unified alerts for the user:
// 1. Version drift alerts from `dependencies`
// 2. Vulnerability alerts from `dependency_vul`
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const [vulnRes, driftRes] = await Promise.all([
      // Fetch open and resolved vulnerabilities
      pool.query(
        `SELECT 
           dv.dependency_id as dep_id,
           dv.cve_id as cve_id,
           'VULNERABILITY' as type,
           d.dependency_name as target,
           p.project_name as project,
           dv.severity,
           dv.summary as description,
           dv.is_resolved as resolved,
           d.created_at
         FROM dependency_vul dv
         JOIN dependencies d ON dv.dependency_id = d.dependency_id
         JOIN projects p ON dv.project_id = p.project_id
         WHERE p.user_id = $1`,
        [userId]
      ),
      // Fetch open and resolved version drifts
      pool.query(
        `SELECT 
           d.dependency_id as id,
           'VERSION_DRIFT' as type,
           d.dependency_name as target,
           p.project_name as project,
           'medium' as severity,
           'New version available (' || d.latest_version || ')' as description,
           d.is_resolved as resolved,
           d.created_at
         FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1 
         AND d.current_version IS NOT NULL 
         AND d.latest_version IS NOT NULL 
         AND d.current_version != d.latest_version`,
        [userId]
      )
    ]);

    // Format all alerts into a unified array
    const allAlerts = [
      ...vulnRes.rows.map(row => ({
        id: `${row.dep_id}::${row.cve_id}`, // Composite ID for vulnerabilities
        type: row.type,
        title: `${row.severity === 'critical' ? 'Critical' : row.severity.charAt(0).toUpperCase() + row.severity.slice(1)} vulnerability detected`,
        targetDetails: `${row.target} in ${row.project}`,
        description: row.description,
        isResolved: row.resolved,
        createdAt: row.created_at,
        severityClass: row.severity.toLowerCase(),
        cve: row.cve_id
      })),
      ...driftRes.rows.map(row => ({
        id: `${row.id}`, // Single ID for dependencies
        type: row.type,
        title: `Version drift detected`,
        targetDetails: `${row.target} in ${row.project}`,
        description: row.description,
        isResolved: row.resolved,
        createdAt: row.created_at,
        severityClass: 'warning'
      }))
    ];

    // Sort globally by created_at descending
    allAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allAlerts);

  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ message: "Server error fetching alerts" });
  }
};

// PATCH /api/alerts/:type/:id/resolve
// Marks an alert as resolved
exports.resolveAlert = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'VULNERABILITY') {
      const [depId, cveId] = id.split('::');
      await pool.query("UPDATE dependency_vul SET is_resolved = true WHERE dependency_id = $1 AND cve_id = $2", [depId, cveId]);
    } else if (type === 'VERSION_DRIFT') {
      await pool.query("UPDATE dependencies SET is_resolved = true WHERE dependency_id = $1", [id]);
    } else {
      return res.status(400).json({ message: "Invalid alert type" });
    }

    res.json({ message: "Alert resolved successfully" });
  } catch (err) {
    console.error("Error resolving alert:", err);
    res.status(500).json({ message: "Server error marking alert as resolved" });
  }
};
