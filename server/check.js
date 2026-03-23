const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const r1 = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'dependency_vul'");
  console.log('dependency_vul:', r1.rows.map(x => x.column_name));
  
  const r2 = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'dependencies'");
  console.log('dependencies:', r2.rows.map(x => x.column_name));
  
  p.end();
}
check();
