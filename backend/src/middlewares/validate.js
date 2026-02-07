import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body, query, or params against the schema
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // Check if it's a Zod validation error
    if (err instanceof z.ZodError) {
      // Ensure err.issues exists and is an array
      const errors = Array.isArray(err.issues) ? err.issues : [];
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors: errors.map((e) => ({
            field: e.path[1] || e.path[0] || 'unknown',
            message: e.message || 'Invalid value'
        }))
      });
    }
    
    // Log unexpected errors for debugging
    console.error('Validation middleware error (not ZodError):', err);
    
    // If it's not a ZodError, pass it to the global error handler
    next(err);
  }
};