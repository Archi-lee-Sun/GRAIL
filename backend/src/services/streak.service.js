const { getUserStreakData, updateUserStreak } = require('../queries/streak.queries');

const getTimeDifferenceInDays = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

const updateStreak = async (userId) => {
    try {
        const streakData = await getUserStreakData(userId);
        const { last_active_date, streak_count, streak_freeze_count } = streakData;

        const today = new Date();
        if (!last_active_date) {
            await updateUserStreak(userId, 1, streak_freeze_count, today);
            return;
        }

        if (getTimeDifferenceInDays(last_active_date , today) === 1) {
            await updateUserStreak(userId, streak_count + 1, streak_freeze_count, today);
        } else if(getTimeDifferenceInDays(last_active_date , today) > 1) {
            if(streak_freeze_count > 0) {
                await updateUserStreak(userId , streak_count , streak_freeze_count - 1 , today)
            } else {
                await updateUserStreak(userId , 1 , 0 , today)
            }
        }
    } catch (error){
        console.error('Error updating streak:', error);
        throw error;
    }
}

module.exports = {
    updateStreak ,
    getTimeDifferenceInDays 
}
