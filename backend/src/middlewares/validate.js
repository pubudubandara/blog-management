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
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors: err.errors.map((e) => ({
            field: e.path[1] || e.path[0],
            message: e.message
        }))
      });
    }
    next(err);
  }
};