const { Pool } = require('pg');

// Postgres Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = () => { return pool; }