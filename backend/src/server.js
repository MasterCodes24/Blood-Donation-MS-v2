require('dotenv').config();

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('Missing JWT_SECRET or DATABASE_URL in .env');
  process.exit(1);
}

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

pool
  .query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });