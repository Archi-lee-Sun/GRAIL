const pool = require('../config/db');

const getAllTracks = async () => {
    const query = `
        SELECT id, slug, title, description, is_foundation, unlock_after_lesson_count, display_order
        FROM tracks
        ORDER BY display_order
    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching tracks:', error);
        throw error;
    }
};

const getTrackBySlug = async (slug) => {
    const query = `
        SELECT id, slug, title, description, is_foundation, unlock_after_lesson_count, display_order
        FROM tracks
        WHERE slug = $1
    `;

    try {
        const result = await pool.query(query, [slug]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching track by slug:', error);
        throw error;
    }
};

const getLessonsByTrackSlug = async (slug) => {
    const query = `
        SELECT lessons.id, lessons.slug, lessons.title, lessons.display_order, lessons.xp_reward
        FROM lessons
        INNER JOIN tracks ON tracks.id = lessons.track_id
        WHERE tracks.slug = $1
        ORDER BY lessons.display_order
    `;

    try {
        const result = await pool.query(query, [slug]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching lessons by track slug:', error);
        throw error;
    }
};

module.exports = {
    getAllTracks,
    getTrackBySlug,
    getLessonsByTrackSlug
};
