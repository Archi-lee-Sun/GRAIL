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
        WITH first_foundation_lesson AS (
            SELECT id
            FROM lessons
            WHERE track_id = (SELECT id FROM tracks WHERE is_foundation = true)
            ORDER BY display_order ASC
            LIMIT 1
        )
        INSERT INTO user_lesson_progress (user_id, lesson_id, status)
        SELECT
            $1,
            lessons.id,
            CASE
                WHEN lessons.id = (SELECT id FROM first_foundation_lesson) THEN 'unlocked'
                ELSE 'locked'
            END
        FROM lessons
        INNER JOIN tracks ON tracks.id = lessons.track_id
        ORDER BY tracks.display_order, lessons.display_order
        ON CONFLICT (user_id, lesson_id) DO NOTHING
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
