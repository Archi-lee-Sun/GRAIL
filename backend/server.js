const app = require('./app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');  // sanity check
    console.log('Database ready');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

start();