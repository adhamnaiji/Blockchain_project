const fs = require('fs');
const path = require('path');
const pool = require('./db');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        blockchain_id INTEGER NOT NULL UNIQUE,
        creator_address VARCHAR(42) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(18, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        is_funded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL,
        donor_address VARCHAR(42) NOT NULL,
        amount DECIMAL(18, 4) NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(blockchain_id)
    );
`;

const initDb = async () => {
    try {
        await pool.query(createTableQuery);
        console.log('Campaigns table created or already exists.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        pool.end();
    }
};

initDb();
