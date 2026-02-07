// src/repositories/userRepository.js
import db from '../config/db.js';

class UserRepository {
    async create(userData) {
        const { username, email, password_hash, role } = userData;
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

    // --- NEW METHOD ---
    async findAll() {
        // Select only safe fields
        const [rows] = await db.execute(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    }
}

export default new UserRepository();