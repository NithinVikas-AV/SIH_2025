// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Try to verify the database connection immediately and log the result.
(async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err && err.message ? err.message : err);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
