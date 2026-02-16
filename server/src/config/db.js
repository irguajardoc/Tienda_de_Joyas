
require("dotenv").config();
const { Pool } = require("pg");

const useDatabaseUrl = Boolean(process.env.DATABASE_URL);

const pool = useDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 5432),
    });

pool.on("error", (err) => {
  console.error("Unexpected PG error:", err);
});

module.exports = pool;
