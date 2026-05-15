const pool = require('../config/db');

const getLessonProgress = async (userId , lessonId) => {
    const query = `
        SELECT * FROM user_lesson_progress
        WHERE user_id = $1 AND lesson_id = $2
    `;

    const values = [userId , lessonId];

    try {
        const result = await pool.query(query , values);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        throw error;
    }
}

const updateLessonStage = async (userId, lessonId, newStage) => {
    const query = `
        UPDATE user_lesson_progress
        SET current_stage = $1
        WHERE user_id = $2 AND lesson_id = $3
        RETURNING *
    `

    const values = [newStage, userId, lessonId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating lesson stage:', error);
        throw error;
    }
}

const updateLessonStatus = async (userId, lessonId, status) => {
    const query = `
        UPDATE user_lesson_progress
        SET status = $1
        WHERE user_id = $2 AND lesson_id = $3
        RETURNING *
    `;

    const values = [status, userId, lessonId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating lesson status:', error);
        throw error;
    }
}

const saveTaskAttempt = async(userId, taskId, stage, responseData, score, feedback, xpEarned) => {
    const query = `
        INSERT INTO task_attempts
        (user_id , task_id , stage , response_data , score , feedback , xp_earned , attempted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
    `;
    const values = [userId, taskId, stage, JSON.stringify(responseData), score, JSON.stringify(feedback), xpEarned];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error saving task attempt:', error);
        throw error;
    }
}

module.exports = {
    getLessonProgress,
    updateLessonStage,
    updateLessonStatus,
    saveTaskAttempt
}