const {
    getLessonBySlug,
    getLessonTasks
} = require('../queries/lessons.queries');

const getLesson = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const lesson = await getLessonBySlug(slug, req.user.id);

        if (!lesson) {
            const error = new Error('Lesson not found');
            error.status = 404;
            return next(error);
        }

        res.json({ lesson });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLesson
};
