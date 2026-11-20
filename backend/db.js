const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dioganize_db',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10
};

if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(poolConfig);

db.getConnection()
  .then((connection) => {
    console.log('[MYSQL] Database Connected');
    connection.release();
  })
  .catch((error) => {
    console.error('[MYSQL] Connection Error:', error.message);
  });

module.exports = db;
