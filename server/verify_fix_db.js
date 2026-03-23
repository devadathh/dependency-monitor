const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyFix() {
    try {
        // Get a user and project to test with
        const setup = await pool.query("SELECT p.project_id, p.user_id FROM projects p LIMIT 1");

        if (setup.rows.length === 0) {
            console.log("No projects found to test.");
            return;
        }

        const { project_id, user_id } = setup.rows[0];
        console.log(`Testing with Project ID: ${project_id}, User ID: ${user_id}`);

        // Run the EXACT query used in the controller
        const query = `
      SELECT 
        project_id, 
        project_name, 
        description, 
        last_scanned, 
        created_at 
       FROM projects 
       WHERE project_id = $1 AND user_id = $2
    `;

        const res = await pool.query(query, [project_id, user_id]);

        if (res.rows.length > 0) {
            const project = res.rows[0];
            console.log("Query Result Row:", project);
            console.log("has last_scanned:", project.hasOwnProperty('last_scanned'));
            console.log("has created_at:", project.hasOwnProperty('created_at'));
            console.log("Final Display Logic Check:", project.last_scanned || project.created_at);
        } else {
            console.log("Query returned no rows (unexpected since we just found one).");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

verifyFix();
