const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER || 'openpg',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'openpgpwd',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' // Connect to default DB first
});

async function createDatabase() {
    try {
        await client.connect();
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'donations_db'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE donations_db');
            console.log('Database donations_db created successfully');
        } else {
            console.log('Database donations_db already exists');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
