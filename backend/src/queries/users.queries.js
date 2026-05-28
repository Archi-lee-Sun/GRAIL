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

const getUserProgress = async (userId) => {
    const query = `
        SELECT ulp.* , l.slug AS lesson_slug , l.title AS lesson_title
        FROM user_lesson_progress ulp
        JOIN lessons l ON ulp.lesson_id = l.id
        WHERE ulp.user_id = $1
    `
    const values = [userId]
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        throw error;
    }
}

const getDueReviews = async (userId) => {
    const query = `
        SELECT ucs.* , l.slug AS lesson_slug , l.title AS lesson_title
        FROM user_concept_srs ucs
        JOIN lessons l on ucs.lesson_id = l.id
        WHERE ucs.user_id = $1 AND ucs.next_review_at <= NOW()
    `
    const values = [userId]
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching due reviews:', error);
        throw error;
    }
}

module.exports = {
     getUserById,
     getUserProgress,
     getDueReviews
};
