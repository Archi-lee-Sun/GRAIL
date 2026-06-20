const { getUserStreakData, updateUserStreak } = require('../queries/streak.queries');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfUtcDay = (date) => {
    const day = new Date(date);
    day.setUTCHours(0,0,0,0);
    return day;
}

const addUtcDays = (date, days) => {
    const day = startOfUtcDay(date);
    day.setUTCDate(day.getUTCDate() + days);
    return day;
}

const getTimeDifferenceInDays = (date1, date2) => {
    if (!date1 || !date2) return null;
    const d1 = startOfUtcDay(date1);
    const d2 = startOfUtcDay(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / MS_PER_DAY);
}

const logStreakUpdate = ({ userId, source, oldStreak, gapDays, freezeCount, newStreak, newFreezeCount }) => {
    console.log(
        `[streak:${source}] userId=${userId} oldStreak=${oldStreak} gapDays=${gapDays} freezeCount=${freezeCount} newStreak=${newStreak} newFreezeCount=${newFreezeCount}`
    );
}

const updateStreak = async (userId) => {
    try {
        const streakData = await getUserStreakData(userId);
        const { last_active_date } = streakData;
        const streak_count = Number(streakData.streak_count || 0);
        const streak_freeze_count = Number(streakData.streak_freeze_count || 0);

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
            const missedDays = daysSinceActive - 1;
            if(streak_freeze_count >= missedDays) {
                await updateUserStreak(userId , streak_count + 1 , streak_freeze_count - missedDays , today)
                logStreakUpdate({
                    userId,
                    source: 'stage-complete:freeze-covered-increment',
                    oldStreak: streak_count,
                    gapDays: daysSinceActive,
                    freezeCount: streak_freeze_count,
                    newStreak: streak_count + 1,
                    newFreezeCount: streak_freeze_count - missedDays
                });
            } else {
                await updateUserStreak(userId , 1 , 0 , today)
                logStreakUpdate({
                    userId,
                    source: 'stage-complete:reset-start-new',
                    oldStreak: streak_count,
                    gapDays: daysSinceActive,
                    freezeCount: streak_freeze_count,
                    newStreak: 1,
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

        const streakCount = Number(streakData.streak_count || 0);
        const freezeCount = Number(streakData.streak_freeze_count || 0);
        const missedDays = daysSinceActive - 1;
        const accountedThroughYesterday = addUtcDays(today, -1);

        if (freezeCount >= missedDays) {
            await updateUserStreak(userId, streakCount, freezeCount - missedDays, accountedThroughYesterday);
            logStreakUpdate({
                userId,
                source: 'dashboard:freeze-covered',
                oldStreak: streakCount,
                gapDays: daysSinceActive,
                freezeCount,
                newStreak: streakCount,
                newFreezeCount: freezeCount - missedDays
            });
        } else {
            await updateUserStreak(userId, 0, 0, accountedThroughYesterday);
            logStreakUpdate({
                userId,
                source: 'dashboard:reset',
                oldStreak: streakCount,
                gapDays: daysSinceActive,
                freezeCount,
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
