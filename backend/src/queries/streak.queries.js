const pool = require('../config/db');

const getUserStreakData = async (userId) => {
    const query = `
         SELECT last_active_date, streak_count, streak_freeze_count
         FROM users
         WHERE id = $1
    `

    const values = [userId]

    try {
        const result = await pool.query(query , values)
        return result.rows[0]
    } catch(error){
        console.error('', error);
        throw error;
    }
}

const updateUserStreak = async (userId, streakCount, freezeCount, lastActiveDate) => {
    const query = `
         UPDATE users
         SET streak_count = $1 ,
         streak_freeze_count = $2 , 
         last_active_date = $3
         WHERE id = $4
    `

    const values = [streakCount, freezeCount, lastActiveDate , userId]

    try {
        await pool.query(query , values)
    } catch(error){
        console.error('', error);
        throw error;
    }
}

module.exports =  {
    getUserStreakData , 
    updateUserStreak ,
}
