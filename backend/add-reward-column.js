const pool = require('./db');

const addRewardColumn = async () => {
    try {
        await pool.query('ALTER TABLE donations ADD COLUMN IF NOT EXISTS reward_tier INTEGER DEFAULT 0;');
        console.log('Successfully added reward_tier column to donations table.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        pool.end();
    }
};

addRewardColumn();
