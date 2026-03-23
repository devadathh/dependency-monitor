const pool = require("../db");

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const [projRes, depRes, vulRes, driftRes] = await Promise.all([
      // Total projects for this user
      pool.query(
        "SELECT COUNT(*) FROM projects WHERE user_id = $1",
        [userId]
      ),

      // Total dependencies across all user's projects
      pool.query(
        `SELECT COUNT(*) FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1`,
        [userId]
      ),

      // Total vulnerable dependencies (distinct deps with at least 1 CVE)
      pool.query(
        `SELECT COUNT(DISTINCT dv.dependency_id)
         FROM dependency_vul dv
         JOIN projects p ON dv.project_id = p.project_id
         WHERE p.user_id = $1`,
        [userId]
      ),

      // Dependency drift: packages where current_version != latest_version
      pool.query(
        `SELECT COUNT(*) FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1
           AND d.current_version IS NOT NULL
           AND d.latest_version IS NOT NULL
           AND d.current_version != d.latest_version`,
        [userId]
      ),
    ]);

    res.json({
      totalProjects: parseInt(projRes.rows[0].count),
      totalDependencies: parseInt(depRes.rows[0].count),
      vulnerableDependencies: parseInt(vulRes.rows[0].count),
      dependencyDrift: parseInt(driftRes.rows[0].count),
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/dashboard/trends
// Returns month-by-month vulnerability severity counts + dependency drift counts
const getTrends = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const [vulTrendsRes, driftTrendsRes] = await Promise.all([
      // ----- Vulnerability Trends -----
      // dependency_vul has NO timestamp column. We JOIN to dependencies to
      // borrow d.created_at as the month anchor (the dep row was inserted
      // during the same scan that produced the CVE record).
      pool.query(
        `SELECT
           TO_CHAR(DATE_TRUNC('month', d.created_at), 'Mon YYYY') AS month_label,
           DATE_TRUNC('month', d.created_at)                      AS month_date,
           COUNT(*) FILTER (WHERE LOWER(dv.severity) = 'critical') AS critical,
           COUNT(*) FILTER (WHERE LOWER(dv.severity) = 'high')     AS high,
           COUNT(*) FILTER (WHERE LOWER(dv.severity) IN ('medium', 'moderate')) AS moderate,
           COUNT(*) FILTER (WHERE LOWER(dv.severity) = 'low')      AS low
         FROM dependency_vul dv
         JOIN dependencies d  ON dv.dependency_id = d.dependency_id
         JOIN projects      p ON dv.project_id    = p.project_id
         WHERE p.user_id = $1
         GROUP BY month_date
         ORDER BY month_date ASC`,
        [userId]
      ),

      // ----- Dependency Drift Trends -----
      // dependencies.created_at exists – groups outdated deps by month.
      pool.query(
        `SELECT
           TO_CHAR(DATE_TRUNC('month', d.created_at), 'Mon YYYY') AS month_label,
           DATE_TRUNC('month', d.created_at)                      AS month_date,
           COUNT(*)                                                AS drift
         FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1
           AND d.current_version IS NOT NULL
           AND d.latest_version  IS NOT NULL
           AND d.current_version <> d.latest_version
         GROUP BY month_date
         ORDER BY month_date ASC`,
        [userId]
      ),
    ]);

    // Transform rows → Recharts-friendly objects
    const vulnerabilityTrends = vulTrendsRes.rows.map((row) => ({
      month:    row.month_label,
      critical: parseInt(row.critical),
      high:     parseInt(row.high),
      moderate: parseInt(row.moderate),
      low:      parseInt(row.low),
    }));

    const dependencyDriftTrends = driftTrendsRes.rows.map((row) => ({
      month: row.month_label,
      drift: parseInt(row.drift),
    }));

    res.json({ vulnerabilityTrends, dependencyDriftTrends });
  } catch (err) {
    console.error("Error fetching dashboard trends:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats, getTrends };
