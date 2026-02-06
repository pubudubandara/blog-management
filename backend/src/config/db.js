import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'blog_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to promise-based for cleaner async/await code
const promisePool = pool.promise();

console.log(`🔌 Database Pool Created for host: ${process.env.DB_HOST}`);

export default promisePool;