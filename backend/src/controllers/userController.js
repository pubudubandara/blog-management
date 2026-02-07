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
        const user = await userRepository.findById(req.params.id);

        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};