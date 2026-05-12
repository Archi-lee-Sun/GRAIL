module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: 10,

  XP_PER_LESSON: 20,
  XP_STAGE2_TASK: 5,
  XP_STAGE3_TASK: 10,
  XP_STAGE4_TASK: 15,

  SM2_DEFAULT_EASE: 2.5,
  SM2_MIN_EASE: 1.3,

  MOCK_AI: process.env.MOCK_AI === 'true',
};