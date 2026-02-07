import express from 'express';
import * as blogController from '../controllers/blogController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createBlogSchema, updateBlogSchema } from '../validations/schemas.js';

const router = express.Router();

// Public and protected blog routes
router.route('/')
  .get(blogController.getAllBlogs)
  .post(protect, validate(createBlogSchema), blogController.createBlog);

router.route('/:id')
  .get(blogController.getBlogById)
  .put(protect, validate(updateBlogSchema), blogController.updateBlog)
  .delete(protect, restrictTo('admin'), blogController.deleteBlog);

export default router;