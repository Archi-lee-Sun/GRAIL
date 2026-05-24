const { getUserById, getUserProgress, getDueReviews } = require('../queries/users.queries');
const { updateSRS } = require('../services/srs.service');
const { getLearningPath: getLearningPathService } = require('../services/graph.service');

const getDashboard = async (req , res , next) => {
    const userId = req.user.id 
    try {

        const user = await getUserById(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        const progress = await getUserProgress(userId)
        return res.json({ user : user , progress : progress })

    } catch (error) {
        next(error)
    }
}

const getReviews = async (req , res , next) => {
    const userId = req.user.id
    try {
        const reviews = await getDueReviews(userId)
        return res.json({reviews : reviews})
    } catch (error) {
        next(error)
    }
}

const submitReview = async (req, res, next) => {
    const userId = req.user.id
    const { lessonId } = req.params
    const { quality } = req.body

    try {
        if (quality === undefined || !Number.isInteger(quality) || quality < 0 || quality > 5){
            return res.status(400).json({ message: 'Quality must be an integer between 0 and 5' });
        }
        const updatedSrs = await updateSRS(userId, lessonId, quality)
        return res.json({ srs: updatedSrs });
    } catch(error){
        next(error)
    }
}

const getLearningPath = async (req, res, next) => {
    const userId = req.user.id
    const { lessonId } = req.params

    try {
        const learningPath = await getLearningPathService(userId, lessonId)

        if(!learningPath){
            return res.status(404).json({ message: 'Complete foundation lessons first to unlock a path to this lesson' });
        }

        return res.json({ learningPath: learningPath });
    } catch(error){
        next(error)
    }
}

module.exports = {
    getDashboard,
    getReviews ,
    submitReview,
    getLearningPath
}
