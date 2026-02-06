const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

class AuthService {
    async register(data) {
        // 1. Check if user exists
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(data.password, salt);

        // 3. Create user
        const userId = await userRepository.create({ ...data, password_hash });
        
        return { id: userId, ...data };
    }

    async login(email, password) {
        // 1. Find user
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401);
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return { user: { id: user.id, username: user.username, role: user.role }, token };
    }
}

module.exports = new AuthService();