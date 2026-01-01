const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
    try {
        const query = `
            SELECT c.*, COALESCE(SUM(d.amount), 0) as collected_amount 
            FROM campaigns c 
            LEFT JOIN donations d ON c.blockchain_id = d.campaign_id 
            GROUP BY c.id 
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single campaign by ID
app.get('/api/campaigns/:id', async (req, res) => {
    try {
        const query = `
            SELECT c.*, COALESCE(SUM(d.amount), 0) as collected_amount 
            FROM campaigns c 
            LEFT JOIN donations d ON c.blockchain_id = d.campaign_id 
            WHERE c.blockchain_id = $1
            GROUP BY c.id
        `;
        const result = await pool.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new campaign
app.post('/api/campaigns', async (req, res) => {
    const { blockchain_id, creator_address, title, description, goal_amount, duration_days, transaction_hash } = req.body;

    // Validate required fields
    if (blockchain_id === undefined || !creator_address || !title || !description || !goal_amount || !duration_days || !transaction_hash) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const query = `
            INSERT INTO campaigns (blockchain_id, creator_address, title, description, goal_amount, duration_days, transaction_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [blockchain_id, creator_address, title, description, goal_amount, duration_days, transaction_hash];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Campaign already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// Get donations for a campaign
app.get('/api/campaigns/:id/donations', async (req, res) => {
    const campaignId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM donations WHERE campaign_id = $1 ORDER BY created_at DESC', [campaignId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Record a new donation
app.post('/api/donations', async (req, res) => {
    const { campaign_id, donor_address, amount, transaction_hash, reward_tier } = req.body;

    if (!campaign_id || !donor_address || !amount || !transaction_hash) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const query = `
            INSERT INTO donations (campaign_id, donor_address, amount, transaction_hash, reward_tier)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [campaign_id, donor_address, amount, transaction_hash, reward_tier || 0];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update campaign status (e.g. is_funded)
app.put('/api/campaigns/:id/status', async (req, res) => {
    const { is_funded } = req.body;
    try {
        const query = 'UPDATE campaigns SET is_funded = $1 WHERE blockchain_id = $2 RETURNING *';
        const result = await pool.query(query, [is_funded, req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DEV ONLY: Reset database
app.delete('/api/admin/reset', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE donations, campaigns RESTART IDENTITY CASCADE');
        res.json({ message: 'Database reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
