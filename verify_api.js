const { Pool } = require("pg");
require("dotenv").config({ path: "./server/.env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkProject() {
    try {
        const res = await pool.query("SELECT * FROM projects LIMIT 1");
        if (res.rows.length > 0) {
            const project = res.rows[0];
            console.log("Keys in project row:", Object.keys(project));
            console.log("last_scanned value:", project.last_scanned);
            console.log("created_at value:", project.created_at);
            console.log("Type of last_scanned:", typeof project.last_scanned);
        } else {
            console.log("No projects found.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkProject();
