import blogRepository from "../repositories/blogRepository.js";
import { generateSummary } from "./summaryService.js";
import AppError from "../utils/AppError.js";

class BlogService {
  async createBlog(data, user) {
    // 1. Generate Summary Logic
    const summary = await generateSummary(data.content);

    // 2. Save to DB
    const blogId = await blogRepository.create({
      ...data,
      summary,
      author_id: user.id,
    });

    return { id: blogId, ...data, summary };
  }

  async getAllBlogs(page = 1, limit = 10) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { blogs, total } = await blogRepository.findAll(limitNum, offset);

    return {
      data: blogs,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
  async getBlogById(id) {
    const blog = await blogRepository.findById(id);
    if (!blog) throw new AppError("Blog not found", 404);
    return blog;
  }

  async updateBlog(id, data, user) {
    const blog = await this.getBlogById(id);

    // Permission Check: Owner OR Admin
    if (blog.author_id !== user.id && user.role !== "admin") {
      throw new AppError("You are not allowed to edit this blog", 403);
    }

    // If content changed, re-generate summary
    let summary;
    if (data.content) {
      summary = await generateSummary(data.content);
    }

    await blogRepository.update(id, { ...data, summary });
    return { id, ...data, summary };
  }

  async deleteBlog(id) {
    const deleted = await blogRepository.delete(id);
    if (!deleted) throw new AppError("Blog not found", 404);
    return true;
  }
}

export default new BlogService();
