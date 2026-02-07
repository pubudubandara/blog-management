import express from 'express';
import { 
    register, 
    login, 
    logout, 
    getMe, 
    refreshToken 
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/schemas.js';

const router = express.Router();

// Public routes - with validation middleware
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;