import blogService from "../services/blogService.js";
import { generateSummary } from "../services/summaryService.js";

// Create blog
export const createBlog = async (req, res, next) => {
  try {
    const { title, content, summary: userSummary } = req.body;
    let summary;
    if (userSummary && userSummary.trim()) {
      summary = userSummary.trim();
    } else {
      summary = await generateSummary(content);
    }
    const blog = await blogService.createBlog({ title, content, summary }, req.user);
    res.status(201).json({ status: "success", data: blog });
  } catch (err) {
    next(err);
  }
};

// Get all blogs
export const getAllBlogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await blogService.getAllBlogs(page, limit);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

// Get single blog
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    res.status(200).json({ status: "success", data: blog });
  } catch (err) {
    next(err);
  }
};

// Update blog
export const updateBlog = async (req, res, next) => {
  try {
    const { title, content, summary: userSummary } = req.body;
    let summary = userSummary;
    
    // Regenerate summary 
    if (content && !userSummary) {
      const currentBlog = await blogService.getBlogById(req.params.id);
      if (currentBlog.content !== content) {
        summary = await generateSummary(content);
      } else {
        summary = currentBlog.summary;
      }
    }
    
    const blog = await blogService.updateBlog(
      req.params.id,
      { title, content, summary },
      req.user,
    );
    res.status(200).json({ status: "success", data: blog });
  } catch (err) {
    next(err);
  }
};

// Delete blog
export const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlog(req.params.id);
    res.status(200).json({ status: "success", message: "Blog deleted" });
  } catch (err) {
    next(err);
  }
};