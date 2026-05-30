const pool = require('../config/db');

const getUnlockedVaultEntries = async (userId) => {
    const query = `
        SELECT ve.* 
        FROM vault_entries ve
        JOIN user_vault_unlocks uvu ON ve.id = uvu.vault_entry_id
        WHERE uvu.user_id = $1
        ORDER BY ve.display_order
    `

    const values = [userId]

    try {
        const result = await pool.query(query , values)
        return result.rows
    } catch (error) {
        console.error('Error fetching unlocked vault entries:', error);
        throw error;
    }
}

const getVaultEntryBySlug = async (slug , userId) => {
    const query = `
       SELECT ve.* 
       FROM vault_entries ve
       JOIN user_vault_unlocks uvu ON ve.id = uvu.vault_entry_id
       WHERE ve.slug = $1 AND uvu.user_id = $2
    `
    const values = [slug, userId]

    try {
        const result = await pool.query(query , values)
        return result.rows[0]
    } catch (error) {
        console.error('Error fetching vault entry by slug:', error);
        throw error;
    }
}

const unlockVaultEntries = async (userId, lessonId) => {
    const query = `
        INSERT INTO user_vault_unlocks (user_id, vault_entry_id, unlocked_at)
        SELECT $1, id, NOW()
        FROM vault_entries
        WHERE unlocks_after_lesson_id = $2
        ON CONFLICT DO NOTHING
    `;
    const values = [userId, lessonId];

    try {
        await pool.query(query, values);
    } catch (error) {
        console.error('Error unlocking vault entries:', error);
        throw error;
    }
}

module.exports = {
    getUnlockedVaultEntries,
    getVaultEntryBySlug,
    unlockVaultEntries
}
