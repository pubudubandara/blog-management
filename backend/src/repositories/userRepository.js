import db from '../config/db.js';

class UserRepository {
    async create(userData) {
        const { username, email, password_hash, role } = userData;
        // Using prepared statements (?) to prevent SQL Injection [cite: 9]
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

    async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await db.execute('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}

export default new UserRepository();