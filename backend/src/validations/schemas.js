import { z } from 'zod';

// 1. Auth Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'user', 'editor']).optional(), // Optional, defaults to user in DB
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

// 2. Blog Validation Schemas
export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    content: z.string().min(20, 'Content must be at least 20 characters for summarization'),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    content: z.string().min(20).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});