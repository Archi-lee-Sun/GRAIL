const { getUserStreakData, updateUserStreak } = require('../queries/streak.queries');

const getTimeDifferenceInDays = (date1, date2) => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setUTCHours(0,0,0,0);
    d2.setUTCHours(0,0,0,0);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

const logStreakUpdate = ({ userId, source, oldStreak, gapDays, freezeCount, newStreak, newFreezeCount }) => {
    console.log(
        `[streak:${source}] userId=${userId} oldStreak=${oldStreak} gapDays=${gapDays} freezeCount=${freezeCount} newStreak=${newStreak} newFreezeCount=${newFreezeCount}`
    );
}

const updateStreak = async (userId) => {
    try {
        const streakData = await getUserStreakData(userId);
        const { last_active_date, streak_count, streak_freeze_count } = streakData;

        const today = new Date();
        if (!last_active_date) {
            await updateUserStreak(userId, 1, streak_freeze_count, today);
            logStreakUpdate({
                userId,
                source: 'stage-complete:first-active',
                oldStreak: streak_count,
                gapDays: null,
                freezeCount: streak_freeze_count,
                newStreak: 1,
                newFreezeCount: streak_freeze_count
            });
            return;
        }

        const daysSinceActive = getTimeDifferenceInDays(last_active_date , today);
        if (daysSinceActive === 0) {
            logStreakUpdate({
                userId,
                source: 'stage-complete:same-day',
                oldStreak: streak_count,
                gapDays: daysSinceActive,
                freezeCount: streak_freeze_count,
                newStreak: streak_count,
                newFreezeCount: streak_freeze_count
            });
            return;
        }

        if (daysSinceActive === 1) {
            await updateUserStreak(userId, streak_count + 1, streak_freeze_count, today);
            logStreakUpdate({
                userId,
                source: 'stage-complete:increment',
                oldStreak: streak_count,
                gapDays: daysSinceActive,
                freezeCount: streak_freeze_count,
                newStreak: streak_count + 1,
                newFreezeCount: streak_freeze_count
            });
        } else if(daysSinceActive > 1) {
            if(streak_freeze_count > 0) {
                await updateUserStreak(userId , streak_count , streak_freeze_count - 1 , today)
                logStreakUpdate({
                    userId,
                    source: 'stage-complete:freeze-used',
                    oldStreak: streak_count,
                    gapDays: daysSinceActive,
                    freezeCount: streak_freeze_count,
                    newStreak: streak_count,
                    newFreezeCount: streak_freeze_count - 1
                });
            } else {
                await updateUserStreak(userId , 0 , 0 , today)
                logStreakUpdate({
                    userId,
                    source: 'stage-complete:reset',
                    oldStreak: streak_count,
                    gapDays: daysSinceActive,
                    freezeCount: streak_freeze_count,
                    newStreak: 0,
                    newFreezeCount: 0
                });
            }
        }
    } catch (error){
        console.error('Error updating streak:', error);
        throw error;
    }
}

const refreshStreakStatus = async (userId) => {
    try {
        const streakData = await getUserStreakData(userId);
        if (!streakData?.last_active_date) return streakData;

        const today = new Date();
        const daysSinceActive = getTimeDifferenceInDays(streakData.last_active_date, today);
        if (daysSinceActive === null || daysSinceActive <= 1) return streakData;

        if (streakData.streak_freeze_count > 0) {
            await updateUserStreak(userId, streakData.streak_count, streakData.streak_freeze_count - 1, today);
            logStreakUpdate({
                userId,
                source: 'dashboard:freeze-used',
                oldStreak: streakData.streak_count,
                gapDays: daysSinceActive,
                freezeCount: streakData.streak_freeze_count,
                newStreak: streakData.streak_count,
                newFreezeCount: streakData.streak_freeze_count - 1
            });
        } else {
            await updateUserStreak(userId, 0, 0, today);
            logStreakUpdate({
                userId,
                source: 'dashboard:reset',
                oldStreak: streakData.streak_count,
                gapDays: daysSinceActive,
                freezeCount: streakData.streak_freeze_count,
                newStreak: 0,
                newFreezeCount: 0
            });
        }

        return getUserStreakData(userId);
    } catch (error) {
        console.error('Error refreshing streak status:', error);
        throw error;
    }
}

module.exports = {
    updateStreak ,
    refreshStreakStatus,
    getTimeDifferenceInDays 
}
