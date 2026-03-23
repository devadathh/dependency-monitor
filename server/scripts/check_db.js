const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgresql://postgres:Dhipa123@localhost:5432/ProjectDemo",
});

async function checkSchema() {
    try {
        console.log("Connecting...");
        const res = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
        );
        console.log("Tables:", res.rows.map((row) => row.table_name));

        for (const row of res.rows) {
            console.log(`\nChecking columns for ${row.table_name}:`);
            const cols = await pool.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
                [row.table_name]
            );
            cols.rows.forEach(col => console.log(` - ${col.column_name} (${col.data_type})`));
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkSchema();
