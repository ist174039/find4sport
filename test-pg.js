const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
async function checkPolices() {
  await client.connect();
  const res = await client.query("SELECT pol.polname, pol.polcmd, pg_get_expr(pol.polqual, pol.polrelid) AS qual FROM pg_policy pol JOIN pg_class cl ON pol.polrelid = cl.oid WHERE cl.relname = 'events';");
  console.log(res.rows);
  await client.end();
}
checkPolices();
