// src/controllers/userController.js
import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await userRepository.findAll();
        
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await userRepository.findById(userId);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // --- Data Filtering Based on Requester ---

        // Who is making the request? (req.user refers to the currently logged-in person)
        const requester = req.user;

        // Case 1: If the requester is an admin or the user themselves -> Send Full Details
        if (requester.role === 'admin' || requester.id === user.id) {
            return res.status(200).json({
                status: 'success',
                data: { user } // Send everything: Email, Role, etc.
            });
        }

        // Case 2: If it's someone else -> Send only Public Details
        return res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    // email: user.email <-- NOT sending this!
                    // role: user.role <-- NOT sending this!
                }
            }
        });

    } catch (err) {
        next(err);
    }
};