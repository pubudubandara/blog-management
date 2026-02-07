import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <--- 1. Import this 

import AppError from './utils/AppError.js';
import { errorHandler } from './middlewares/errorMiddleware.js'; 

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Log requests to console

// 2. SWAGGER DOCS SETUP - Using External YAML File
const swaggerFile = readFileSync(join(__dirname, '../swagger.yaml'), 'utf8');
const swaggerDocument = yaml.parse(swaggerFile);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3. ROUTES
app.use('/auth', authRoutes);
app.use('/users', userRoutes); // <--- 2. Add this
app.use('/blogs', blogRoutes);

// 4. UNHANDLED ROUTES
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5. GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;