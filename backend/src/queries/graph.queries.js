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

const getDirectDependents = async (lessonId) => {
    const query = `
        SELECT lesson_id FROM lesson_dependencies
        WHERE depends_on_id = $1
    `
    const values = [lessonId]

    try {
        const result = await pool.query(query , values);
        return result.rows
    } catch (error) {
        console.error('Error fetching direct dependents:', error);
        throw error;
    }
}

const checkAllDepsComplete = async (userId , lessonId) => {
    const query = `
        SELECT ld.depends_on_id , ulp.status 
        FROM lesson_dependencies ld
        JOIN user_lesson_progress ulp ON ld.depends_on_id = ulp.lesson_id 
        WHERE ld.lesson_id = $1 AND ulp.user_id = $2
    `
    const values = [lessonId, userId]
    try {
        const result = await pool.query(query , values);
        for(let row of result.rows){
            if(row.status !== 'complete') return false;
        }
        return true 
    } catch (error) {
        console.error('Error checking dependency completion:', error);
        throw error;
    }
}

const unlockTrackFirstLesson = async (userId, trackSlug) => {
    const query = `
        WITH first_track_lesson AS (
            SELECT l.id
            FROM lessons l
            JOIN tracks t ON t.id = l.track_id
            WHERE t.slug = $2
            ORDER BY l.display_order ASC
            LIMIT 1
        )
        INSERT INTO user_lesson_progress (user_id, lesson_id, status, current_stage)
        SELECT $1, id, 'unlocked', 1
        FROM first_track_lesson
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
            status = CASE
                WHEN user_lesson_progress.status = 'locked' THEN 'unlocked'
                ELSE user_lesson_progress.status
            END,
            current_stage = CASE
                WHEN user_lesson_progress.status = 'locked' THEN 1
                ELSE user_lesson_progress.current_stage
            END
        RETURNING *
    `;
    const values = [userId, trackSlug];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error unlocking first lesson for track:', error);
        throw error;
    }
}

const getCompletedLessonCount = async (userId) => {
    const query = `
        SELECT COUNT(*)::int AS completed_count
        FROM user_lesson_progress
        WHERE user_id = $1 AND status = 'complete'
    `;
    const values = [userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0]?.completed_count || 0;
    } catch (error) {
        console.error('Error counting completed lessons:', error);
        throw error;
    }
}

const getTracksWithUnlockThreshold = async () => {
    const query = `
        SELECT slug, unlock_after_lesson_count
        FROM tracks
        WHERE unlock_after_lesson_count IS NOT NULL
        ORDER BY display_order ASC
    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching track unlock thresholds:', error);
        throw error;
    }
}

module.exports = {
    getAllDependencies,
    getCompletedLessons,
    getDirectDependents,
    checkAllDepsComplete,
    unlockTrackFirstLesson,
    getCompletedLessonCount,
    getTracksWithUnlockThreshold
}

