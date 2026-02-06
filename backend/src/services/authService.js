import userRepository from '../repositories/userRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

class AuthService {
    async register(data) {
        // Check if user already exists
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(data.password, salt);

        // Save user to database
        const userId = await userRepository.create({ ...data, password_hash });
        
        // Return user data without password
        return { id: userId, ...data };
    }

    async login(email, password) {
        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401);
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // Return user data and token
        return { 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            }, 
            token 
        };
    }

    // Optional: Add logout method
    async logout(userId, refreshToken) {
        // Invalidate refresh token if using refresh token rotation
        // Implementation depends on your refresh token strategy
        console.log(`User ${userId} logged out`);
    }

    // Optional: Add refresh token method
    async refreshToken(refreshToken) {
        // Verify refresh token and generate new access token
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            
            // Check if refresh token is still valid in database
            // (if you're storing refresh tokens)
            
            // Generate new access token
            const accessToken = jwt.sign(
                { id: decoded.id, role: decoded.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' } // Short expiry for access tokens
            );
            
            return { accessToken };
        } catch (err) {
            throw new AppError('Invalid refresh token', 401);
        }
    }
}

// Create single instance
const authService = new AuthService();

// Export the instance
export default authService;