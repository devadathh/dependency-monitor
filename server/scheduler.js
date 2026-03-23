const cron = require("node-cron");
const pool = require("./db");
const { scanDependency } = require("./services/vulnerabilityService");

async function scanAllProjects() {
  console.log("Running scheduled scan...");

  const projects = await pool.query("SELECT project_id FROM projects");

  for (const project of projects.rows) {
    const dependencies = await pool.query(
      "SELECT dependency_id, dependency_name, current_version FROM dependencies WHERE project_id = $1",
      [project.project_id]
    );

    for (const dep of dependencies.rows) {
      const result = await scanDependency(dep.dependency_name, dep.current_version);

      for (const vuln of result.vulnerabilities) {
        await pool.query(
          `INSERT INTO dependency_vul
           (dependency_id, project_id, cve_id, severity, summary)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (dependency_id, cve_id)
           DO NOTHING`,
          [
            dep.dependency_id,
            project.project_id,
            vuln.id,
            vuln.severity || "UNKNOWN",
            vuln.summary || "No summary available"
          ]
        );
      }
    }

    // ✅ Update last_scanned time after scanning this project
    await pool.query(
      "UPDATE projects SET last_scanned = NOW() WHERE project_id = $1",
      [project.project_id]
    );
  }

  console.log("Scheduled scan completed.");
}

/**cron.schedule("0 0 * * *", async () => {
  await scanAllProjects();
});*/
cron.schedule("* * * * *", async () => {
  await scanAllProjects();
});



