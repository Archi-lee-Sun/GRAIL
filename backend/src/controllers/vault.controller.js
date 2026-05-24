const {
    getUnlockedVaultEntries , 
    getVaultEntryBySlug
} = require('../queries/vault.queries');

const getVault = async (req , res , next) => {
    const userId = req.user.id

    try {
        const vaultEntries = await getUnlockedVaultEntries(userId)
        res.json(vaultEntries);
    } catch (error) {
        next(error);
    }
}

const getVaultEntry = async (req , res , next) => {
    const userId = req.user.id
    const {slug} = req.params

    try {
        const vaultEntry = await getVaultEntryBySlug(slug , userId)
        if (!vaultEntry) {
            return res.status(404).json({ message: 'Vault entry not found or not unlocked' });
        }
        res.json(vaultEntry);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getVault ,
    getVaultEntry
}