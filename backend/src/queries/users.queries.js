const pool = require('../config/db');

const getUserById = async (id) => {
    const query = `
        SELECT id, username, email, xp, level, streak_count, created_at 
        FROM users 
        WHERE id = $1
    `;
    
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
};

module.exports = { getUserById };