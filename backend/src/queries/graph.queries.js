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

module.exports = {
    getAllDependencies,
    getCompletedLessons,
    getDirectDependents,
    checkAllDepsComplete
}

