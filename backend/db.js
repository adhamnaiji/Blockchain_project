const { Pool } = require('pg');
require('dotenv').config();

// Use environment variables or fallback to the provided credentials
const pool = new Pool({
    user: process.env.DB_USER || 'openpg',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'donations_db',
    password: process.env.DB_PASSWORD || 'openpgpwd',
    port: process.env.DB_PORT || 5432,
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to PostgreSQL database');
    }
});

module.exports = pool;
