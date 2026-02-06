
import express from 'express';
import { 
    register, 
    login, 
    logout, 
    getMe, 
    refreshToken 
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;