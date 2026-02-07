import { z } from 'zod';

// 1. Auth Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
    .min(8, 'Password must be at least 8 characters') 
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter') 
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')       
    .regex(/[\W_]/, 'Password must contain at least one special character (!@#$...)'), 
    role: z.enum(['admin', 'user', 'editor']).optional(), // Optional, defaults to user in DB
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }).optional(), // Optional because it can come from cookies
});

// 2. Blog Validation Schemas
export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title must not exceed 255 characters'),
    content: z.string().min(20, 'Content must be at least 20 characters for summarization'),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title must not exceed 255 characters').optional(),
    content: z.string().min(20, 'Content must be at least 20 characters').optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const getBlogByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const deleteBlogSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});