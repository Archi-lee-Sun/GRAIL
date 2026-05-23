const {  getSrs , upsertSrsEntry } = require('../queries/srs.queries');
const { SM2_DEFAULT_EASE, SM2_MIN_EASE } = require('../config/constants');

const updateSRS = async (userId, lessonId, quality) => {
    try {
        const srsData = await getSrs(userId , lessonId)
        if (!srsData){
            return  await upsertSrsEntry(
                userId,
                lessonId,
                SM2_DEFAULT_EASE,
                1,
                0,
                new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)),
                quality
            )
        }

        const newEaseFactor = Math.max(
            SM2_MIN_EASE,
            srsData.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        if(quality < 3){
            return await upsertSrsEntry(
                userId,
                lessonId,
                newEaseFactor,
                1,
                0,
                new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)),
                quality
            )
        } else {
            if(srsData.repetitions === 0){
                return await upsertSrsEntry(
                    userId,
                    lessonId,
                    newEaseFactor,
                    1,
                    1,
                    new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)),
                    quality
                )
            } else if(srsData.repetitions === 1){
                return await upsertSrsEntry(
                    userId,
                    lessonId,
                    newEaseFactor,
                    6,
                    2,
                    new Date(Date.now() + (6 * 24 * 60 * 60 * 1000)),
                    quality
                ) 
            } else {
                const intervalDays = Math.round(srsData.interval_days * newEaseFactor)
                return await upsertSrsEntry(
                    userId,
                    lessonId,
                    newEaseFactor,
                    intervalDays,
                    srsData.repetitions + 1,
                    new Date(Date.now() + (intervalDays * 24 * 60 * 60 * 1000)),
                    quality
                )
            }
        }
    } catch(error) {
        console.error('Error updating SRS:', error);
        throw error;
    }
}

module.exports = { updateSRS };