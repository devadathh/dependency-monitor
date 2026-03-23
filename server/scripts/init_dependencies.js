const pool = require("../db");

async function init() {
    try {
        await pool.query(`
     CREATE TABLE IF NOT EXISTS dependencies (
  dependency_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id),
  dependency_name VARCHAR(255) NOT NULL,
  current_version VARCHAR(50),
  UNIQUE(project_id, dependency_name)
);

    `);
        console.log("Dependencies table created/verified");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        await pool.end();
    }
}

init();
