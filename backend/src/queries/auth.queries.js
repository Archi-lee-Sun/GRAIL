const pool = require('../config/db');

const getUserByEmail = async (email) => {
    const query = `
        SELECT * FROM users
        WHERE email = $1
    `;

    const values = [email]

    try {
        const result = await pool.query(query , values);
        return result.rows[0];
    } catch(error){
        console.error('Error fetching user by email:', error);
        throw error;
    }
}

const getUserByUsername = async (username) => {
    const query = `
        SELECT * FROM users
        WHERE username = $1
    `;

    const values = [username];

    try {
        const result = await pool.query(query , values);
        return result.rows[0];
    } catch(error){
        console.error('Error fetching user by username:', error);
        throw error;
    }
}

const createUser = async ({username , email , password_hash}) => {
     const query = `
        INSERT INTO users 
        (username , email , password_hash)
        VALUES ($1 , $2 , $3)
        RETURNING id, email, username, xp, level, streak_count, created_at
     `;

    const values = [username, email, password_hash];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch(error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

const initializeUserLessonProgress = async (userId) => {
    const query = `
        INSERT INTO user_lesson_progress (user_id, lesson_id, status)
        SELECT
            $1,
            lessons.id,
            CASE
                WHEN tracks.is_foundation = true AND lessons.display_order = 1 THEN 'unlocked'
                ELSE 'locked'
            END
        FROM lessons
        INNER JOIN tracks ON tracks.id = lessons.track_id
        ORDER BY tracks.display_order, lessons.display_order
    `;

    try {
        await pool.query(query, [userId]);
    } catch (error) {
        console.error('Error initializing user lesson progress:', error);
        throw error;
    }
};

module.exports = { 
    getUserByEmail, 
    getUserByUsername, 
    createUser,
    initializeUserLessonProgress
};
