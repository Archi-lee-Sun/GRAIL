const {
    getAllTracks,
    getTrackBySlug,
    getLessonsByTrackSlug
} = require('../queries/tracks.queries');

const listTracks = async (req, res, next) => {
    try {
        const tracks = await getAllTracks();
        res.json({ tracks });
    } catch (error) {
        next(error);
    }
};

const getTrack = async (req, res, next) => {
    try {
        const track = await getTrackBySlug(req.params.slug);

        if (!track) {
            const error = new Error('Track not found');
            error.status = 404;
            return next(error);
        }

        res.json({ track });
    } catch (error) {
        next(error);
    }
};

const listTrackLessons = async (req, res, next) => {
    try {
        const track = await getTrackBySlug(req.params.slug);

        if (!track) {
            const error = new Error('Track not found');
            error.status = 404;
            return next(error);
        }

        const lessons = await getLessonsByTrackSlug(req.params.slug);
        res.json({ track, lessons });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listTracks,
    getTrack,
    listTrackLessons
};
