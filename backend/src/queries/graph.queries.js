const pool = require('../config/db');

const getAllDependencies = async () => {
    const query = `
        SELECT * FROM lesson_dependencies

    `;
    try {
        const result = await pool.query(query);
       return result.rows;
    } catch (error) {
        console.error('Error fetching dependencies:', error);
        throw error;
    }
}

const getCompletedLessons = async (userId) => {
    const query = `
         SELECT lesson_id FROM user_lesson_progress
         WHERE user_id = $1 AND status = 'complete'
    `;

    const values = [userId]

    try {
        const result = await pool.query(query , values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching completed lessons:', error);
        throw error;
    }
}
module.exports = {
    getAllDependencies,
    getCompletedLessons
}
