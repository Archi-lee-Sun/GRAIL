const verificationCodes = new Map();
const verifiedEmails = new Map();
const CODE_TTL_MS = 10 * 60 * 1000;

const generateCode = (email) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    verificationCodes.set(email, {
        code,
        expiresAt: Date.now() + CODE_TTL_MS
    });
    verifiedEmails.delete(email);
    return code;
};

const verifyCode = (email, code) => {
    const verified = verifiedEmails.get(email);
    if (verified && verified.code === String(code) && verified.expiresAt >= Date.now()) {
        verifiedEmails.delete(email);
        return true;
    }

    const record = verificationCodes.get(email);
    if (!record || record.expiresAt < Date.now() || record.code !== String(code)) {
        return false;
    }

    verificationCodes.delete(email);
    verifiedEmails.set(email, {
        code: record.code,
        expiresAt: record.expiresAt
    });
    return true;
};

module.exports = {
    generateCode,
    verifyCode
};
