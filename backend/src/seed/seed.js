const pool = require('../config/db');
const tracks = require('./data/tracks.json');
const lessons = require('./data/lessons.json');
const tasks = require('./data/tasks.json');

const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM vault_entries');
        await client.query('DELETE FROM tasks');
        await client.query('DELETE FROM lesson_dependencies');
        await client.query('DELETE FROM lessons');
        await client.query('DELETE FROM tracks');

        const trackMap = {};
        for(const track of tracks) {
            const res = await client.query(`
                INSERT INTO tracks (slug , title , description , is_foundation , unlock_after_lesson_count , display_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id , slug
            `, [track.slug, track.title, track.description, track.is_foundation, track.unlock_after_lesson_count, track.display_order]);

            trackMap[res.rows[0].slug] = res.rows[0].id;
        }
        
        const lessonMap = {};
        for(const lesson of lessons) {
            const res = await client.query(`
                INSERT INTO lessons (slug , title , display_order , xp_reward , concept_markdown , track_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id , slug
            `, [lesson.slug, lesson.title, lesson.display_order, lesson.xp_reward, lesson.concept_markdown, trackMap[lesson.track_slug]]);

            lessonMap[res.rows[0].slug] = res.rows[0].id;
        }

        for(const task of tasks) {
            await client.query(`
                INSERT INTO tasks (stage , task_type , display_order , xp_reward , payload , lesson_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [task.stage, task.task_type, task.display_order, task.xp_reward, JSON.stringify(task.payload), lessonMap[task.lesson_slug]]);
        }

        await client.query('COMMIT');
        console.log('Data seeded successfully!');

    } catch(err){
        await client.query('ROLLBACK');
        console.error('Error seeding data:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

seed();