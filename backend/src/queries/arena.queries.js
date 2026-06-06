const pool = require('../config/db');

const getCurrentChallenge = async () => {
    const query = `
        SELECT * FROM arena_challenges
        WHERE is_active = true
        LIMIT 1
    `
    try {
        const result = await pool.query(query)
        return result.rows[0]
    } catch (error) {
        console.error('Error fetching current challenge:', error);
        throw error;
    }
}


const insertSubmission = async (userId, challengeId, promptText, clarityScore, contextScore, specificityScore, compositeScore, aiFeedback) => {
    const query = `
        INSERT INTO arena_submissions
            (user_id, challenge_id, prompt_text, clarity_score, context_score,
            specificity_score, composite_score, ai_feedback, submitted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
    `

    const values = [userId, challengeId, promptText, clarityScore, contextScore, specificityScore, compositeScore, JSON.stringify(aiFeedback)];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting submission:', error);
        throw error;
    }
}


const getUserSubmissionsForChallenge = async (userId , challengeId) => {
    const query = `
        SELECT * FROM arena_submissions
        WHERE user_id = $1 AND challenge_id = $2
    `
    const values = [userId, challengeId];
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user submissions:', error);
        throw error;
    }
}


const getChallengeParticipants = async (challengeId) => {
    const query = `
        SELECT user_id 
        FROM arena_submissions
        WHERE challenge_id = $1
        GROUP BY user_id
    `
    const values = [challengeId];
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching all submissions for challenge:', error);
        throw error;
    }
}


module.exports = {
    getCurrentChallenge,
    insertSubmission,
    getUserSubmissionsForChallenge,
    getChallengeParticipants
}
