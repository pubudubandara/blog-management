import authService from '../services/authService.js';
import AppError from '../utils/AppError.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Basic validation
        if (!username || !email || !password) {
            throw new AppError('Missing required fields: username, email, password', 400);
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Please provide a valid email address', 400);
        }

        // Username validation
        if (username.length < 3 || username.length > 30) {
            throw new AppError('Username must be between 3 and 30 characters', 400);
        }

        // Password validation
        if (password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 400);
        }

        const user = await authService.register({ username, email, password, role });

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

/**
 * Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400);
        }

        const { user, token } = await authService.login(email, password);

        // Set cookie (optional)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            data: { user, token }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Logout user (clear token)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res, next) => {
    try {
        // Clear token cookie
        res.clearCookie('token');
        
        // If using authService.logout() method (for refresh tokens)
        if (req.user && req.user.id) {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (refreshToken) {
                await authService.logout(req.user.id, refreshToken);
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await userRepository.findById(req.user.id);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @access Public (requires valid refresh token)
 */
export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        if (!refreshToken) {
            throw new AppError('Refresh token required', 400);
        }

        const { accessToken } = await authService.refreshToken(refreshToken);

        res.status(200).json({
            status: 'success',
            data: { accessToken }
        });
    } catch (err) {
        next(err);
    }
};