import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';

// Register a new user
export const register = async (req, res, next) => {
    try {
        // Validation is handled by Zod middleware
        const { username, email, password, role } = req.body;

        // Create user in database
        const user = await authService.register({ username, email, password, role });

        // Return success response
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: { 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email,
                    role: user.role || 'user'
                } 
            }
        });
    } catch (err) {
        next(err);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        // Validation is handled by Zod middleware
        const { email, password } = req.body;

        // Authenticate user and get both tokens
        const { user, accessToken, refreshToken } = await authService.login(email, password);

        // Set refresh token as httpOnly cookie (more secure)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return success response with access token
        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            data: { 
                user, 
                accessToken,
                refreshToken // Also send in response for non-browser clients
            }
        });
    } catch (err) {
        next(err);
    }
};

// Logout user
export const logout = async (req, res, next) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Return success response
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (err) {
        next(err);
    }
};

// Get current user profile
export const getMe = async (req, res, next) => {
    try {
        const user = await userRepository.findById(req.user.id);
        
        // Check if user exists
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Return user data
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

// Refresh access token
export const refreshToken = async (req, res, next) => {
    try {
        // Get refresh token from cookie or body
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        
        // Validation middleware checks if token exists
        // Additional check for cookie fallback
        if (!refreshToken) {
            throw new AppError('Refresh token required', 400);
        }

        // Get new access token
        const { accessToken } = await authService.refreshToken(refreshToken);

        // Return new token
        res.status(200).json({
            status: 'success',
            data: { accessToken }
        });
    } catch (err) {
        next(err);
    }
};