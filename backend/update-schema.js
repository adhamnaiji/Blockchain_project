const pool = require('./db');

const updateSchema = async () => {
    try {
        await pool.query('ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_funded BOOLEAN DEFAULT FALSE;');
        console.log('Successfully added is_funded column to campaigns table.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        pool.end();
    }
};

updateSchema();
