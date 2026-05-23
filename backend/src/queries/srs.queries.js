const pool = require('../config/db');

const getSrs = async (userId , lessonId) => {
    const query = `
        SELECT * FROM user_concept_srs
        WHERE user_id = $1
        AND lesson_id = $2
    `

    const values = [userId , lessonId]

    try {
        const result = await pool.query(query , values);
        return result.rows[0]
    } catch(error){
        console.error('Error fetching SRS data:', error);
        throw error;
    }
}

const upsertSrsEntry = async (userId, lessonId, easeFactor, intervalDays, repetitions, nextReviewAt, lastScore) => {
    const query = `
        INSERT INTO user_concept_srs 
        (user_id, lesson_id, ease_factor, interval_days, repetitions, next_review_at, last_score) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id , lesson_id) 
        DO UPDATE SET
        ease_factor = EXCLUDED.ease_factor,
        interval_days = EXCLUDED.interval_days,
        repetitions = EXCLUDED.repetitions,
        next_review_at = EXCLUDED.next_review_at,
        last_score = EXCLUDED.last_score
        RETURNING *;
    `

    const values = [userId, lessonId, easeFactor, intervalDays, repetitions, nextReviewAt, lastScore]

    try {
        const result = await pool.query(query , values);
        return result.rows[0]
    } catch(error){
        console.error('Error upserting SRS entry:', error);
        throw error;
    }
}

module.exports = {
    getSrs ,
    upsertSrsEntry
}
