const pool = require('../config/db');

const getLessonBySlug = async (slug, userId) => {
    const query = `
        SELECT
            lessons.id,
            lessons.slug,
            lessons.title,
            lessons.concept_markdown,
            lessons.xp_reward,
            lessons.display_order,
            lessons.track_id,
            COALESCE(user_lesson_progress.status, 'locked') AS status
        FROM lessons
        LEFT JOIN user_lesson_progress
            ON user_lesson_progress.lesson_id = lessons.id
            AND user_lesson_progress.user_id = $2
        WHERE lessons.slug = $1
    `;

    const values = [slug, userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching lesson by slug:', error);
        throw error;
    }
};

const getLessonTasksByStage = async (lessonId , stage) => {
    const query = `
        SELECT id, lesson_id, stage, task_type, display_order, payload, xp_reward
        FROM tasks 
        WHERE lesson_id = $1 AND stage = $2
        ORDER BY display_order
    `;

    const values = [lessonId, stage];

    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching lesson tasks:', error);
        throw error;
    }
};

const getTaskById = async (taskId) => {
    const query = `
        SELECT id, lesson_id, stage, task_type, display_order, payload, xp_reward
        FROM tasks
        WHERE id = $1
    `;

    const values = [taskId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching task:', error);
        throw error;
    }
};

module.exports = {
    getLessonBySlug,
    getLessonTasksByStage,
    getTaskById
};
