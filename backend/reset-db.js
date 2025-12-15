const pool = require('./db');

const resetDb = async () => {
    try {
        await pool.query('TRUNCATE donations, campaigns RESTART IDENTITY CASCADE;');
        console.log('Database cleared successfully.');
    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        pool.end();
    }
};

resetDb();
