const pool = require('../config/db');
const tracks = require('./data/tracks.json');
const lessons = require('./data/lessons.json');
const tasks = require('./data/tasks.json');
const vaultEntries = require('./data/vault.json'); 

const vaultCategoryMap = {
    Foundation: 'analysis',
    Reasoning: 'reasoning',
    Writing: 'efficiency',
    Learning: 'analysis',
    'Problem Solving': 'analysis',
    Creativity: 'creative',
    analysis: 'analysis',
    reasoning: 'reasoning',
    efficiency: 'efficiency',
    creative: 'creative',
};

const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM arena_submissions');
        await client.query('DELETE FROM user_vault_unlocks');
        await client.query('DELETE FROM user_concept_srs');
        await client.query('DELETE FROM task_attempts');
        await client.query('DELETE FROM user_lesson_progress');
        await client.query('DELETE FROM vault_entries');
        await client.query('DELETE FROM lesson_dependencies');
        await client.query('DELETE FROM tasks');
        await client.query('DELETE FROM lessons');
        await client.query('DELETE FROM tracks');

        const trackMap = {};
        for (const track of tracks) {
            const res = await client.query(`
                INSERT INTO tracks (slug, title, description, is_foundation, unlock_after_lesson_count, display_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, slug
            `, [track.slug, track.title, track.description, track.is_foundation, track.unlock_after_lesson_count, track.display_order]);

            trackMap[res.rows[0].slug] = res.rows[0].id;
        }

        const lessonMap = {};
        for (const lesson of lessons) {
            const res = await client.query(`
                INSERT INTO lessons (slug, title, display_order, xp_reward, concept_markdown, track_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, slug
            `, [lesson.slug, lesson.title, lesson.display_order, lesson.xp_reward, lesson.concept_markdown, trackMap[lesson.track_slug]]);

            lessonMap[res.rows[0].slug] = res.rows[0].id;
        }

        for (const task of tasks) {
            if (!lessonMap[task.lesson_slug]) {
                console.warn(`WARNING: task references unknown lesson_slug "${task.lesson_slug}" — skipping`);
            }
        }

        for (const task of tasks) {
            const lessonId = lessonMap[task.lesson_slug];
            if (!lessonId) {
                console.warn(`Skipping task: unknown lesson_slug "${task.lesson_slug}"`);
                continue;
            }

            await client.query(`
                INSERT INTO tasks (stage, task_type, display_order, xp_reward, payload, lesson_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [task.stage, task.task_type, task.display_order, task.xp_reward, JSON.stringify(task.payload), lessonId]);
        }

        const dependencyPairs = [
            ['anatomy-of-a-prompt', 'blank-page-problem'],
            ['specificity-spectrum', 'anatomy-of-a-prompt'],
            ['role-assignment', 'specificity-spectrum'],
            ['context-injection', 'role-assignment'],
            ['output-contracts', 'context-injection'],
            ['code-review-prompts', 'debugging-with-ai'],
            ['test-generation', 'code-review-prompts'],
            ['refactoring-prompts', 'test-generation'],
            ['architecture-tradeoffs', 'refactoring-prompts'],
            ['tone-calibration', 'audience-and-intent'],
            ['executive-summaries', 'tone-calibration'],
            ['difficult-messages', 'executive-summaries'],
            ['editing-for-clarity', 'difficult-messages'],
            ['assumption-mapping', 'decision-framing'],
            ['tradeoff-analysis', 'assumption-mapping'],
            ['scenario-planning', 'tradeoff-analysis'],
            ['premortems-red-teams', 'scenario-planning'],
        ];

        for (const [child, parent] of dependencyPairs) {
            if (!lessonMap[child]) {
                console.warn(`Missing lesson: ${child}`);
                continue;
            }
            if (!lessonMap[parent]) {
                console.warn(`Missing lesson: ${parent}`);
                continue;
            }
            await client.query(
                `INSERT INTO lesson_dependencies (lesson_id, depends_on_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [lessonMap[child], lessonMap[parent]]
            );
        }

        let vaultInserted = 0;
        let vaultSkipped  = 0;

        for (const entry of vaultEntries) {
            const lessonId = lessonMap[entry.unlocks_after_lesson_slug];
            const category = vaultCategoryMap[entry.category];

            if (!lessonId) {
                console.warn(`Skipping vault entry "${entry.slug}": unknown lesson_slug "${entry.unlocks_after_lesson_slug}"`);
                vaultSkipped++;
                continue;
            }

            if (!category) {
                throw new Error(`Invalid vault category "${entry.category}" for entry "${entry.slug}". Allowed database categories: reasoning, efficiency, creative, analysis.`);
            }

            await client.query(`
                INSERT INTO vault_entries (
                    slug,
                    title,
                    category,
                    theory_markdown,
                    prompt_template,
                    example_input,
                    example_output,
                    unlocks_after_lesson_id,
                    display_order
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                entry.slug,
                entry.title,
                category,
                entry.theory_markdown,
                entry.prompt_template,
                entry.example_input,
                entry.example_output,
                lessonId,
                entry.display_order,
            ]);

            vaultInserted++;
        }

        await client.query('COMMIT');

        console.log('Tracks seeded:',       tracks.length);
        console.log('Lessons seeded:',      Object.keys(lessonMap).length);
        console.log('Vault entries seeded:', vaultInserted);
        if (vaultSkipped > 0) {
            console.warn('Vault entries skipped:', vaultSkipped);
        }
        console.log('Data seeded successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', err.message);
    } finally {
        client.release();
        process.exit();
    }
};

seed();
