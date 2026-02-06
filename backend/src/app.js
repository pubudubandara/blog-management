import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import authRoutes from './routes/authRoutes.js';

import AppError from './utils/AppError.js';
import { errorHandler } from './middlewares/errorMiddleware.js'; 

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Log requests to console

// 2. SWAGGER DOCS SETUP
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'Blog Management API with Auto-Summarization',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    }
  },
  apis: ['./src/routes/*.js'], // Look for comments in routes
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 3. ROUTES
app.use('/auth', authRoutes);
// app.use('/blogs', blogRoutes);

// 4. UNHANDLED ROUTES
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5. GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;