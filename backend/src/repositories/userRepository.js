import db from '../config/db.js';

class UserRepository {
    async create(userData) {
        const { username, email, password_hash, role } = userData;
        // Using prepared statements (?) to prevent SQL Injection 
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, password_hash, role || 'user']
        );
        return result.insertId;
    }

    async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async findById(id) {
        // Explicitly select fields to EXCLUDE password_hash
        const [rows] = await db.execute(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?', 
            [id]
        );
        return rows[0];
    }

    // Method to find user by username
    async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.execute(sql, [username]);
        return rows[0];
    }

    // Pagination Logic (LIMIT & OFFSET)
    async findAll(limit, offset) {
        const safeLimit = parseInt(limit) || 10;
        const safeOffset = parseInt(offset) || 0;

        // Select only safe fields
        const [rows] = await db.execute(
            `SELECT id, username, email, role, created_at FROM users 
             ORDER BY created_at DESC 
             LIMIT ${safeLimit} OFFSET ${safeOffset}`
        );

        // Get total count for pagination metadata
        const [[{ total }]] = await db.execute(
            'SELECT COUNT(*) as total FROM users'
        );

        return { users: rows, total };
    }
}

export default new UserRepository();