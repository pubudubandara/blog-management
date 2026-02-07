import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';

// Register a new user
export const register = async (req, res, next) => {
    try {
        // Get data from request
        const { username, email, password, role } = req.body;
        
        // Check required fields
        if (!username || !email || !password) {
            throw new AppError('Missing required fields: username, email, password', 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Please provide a valid email address', 400);
        }

        // Check username length
        if (username.length < 3 || username.length > 30) {
            throw new AppError('Username must be between 3 and 30 characters', 400);
        }

        // Check password length
        if (password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 400);
        }

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
        // Get login credentials
        const { email, password } = req.body;

        // Check if credentials provided
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400);
        }

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
        
        // Optional: Invalidate refresh token in database if you're tracking them
        if (req.user && req.user.id) {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (refreshToken) {
                await authService.logout(req.user.id, refreshToken);
            }
        }

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
        // Get refresh token
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        // Check if refresh token exists
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