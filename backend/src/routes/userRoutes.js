// src/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User management routes

// Protect all routes after this middleware
router.use(protect);

// GET /users - Get all users (Admin only)
router.get('/', restrictTo('admin'), userController.getAllUsers);

// GET /users/:id - Get user by ID (Protected)
router.get('/:id', userController.getUserById);

export default router;