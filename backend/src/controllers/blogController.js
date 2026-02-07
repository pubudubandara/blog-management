import blogService from "../services/blogService.js";

// Create a new blog post
export const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlog(req.body, req.user);
    res.status(201).json({ status: "success", data: blog });
  } catch (err) {
    next(err);
  }
};

// Get all blog posts with pagination
export const getAllBlogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await blogService.getAllBlogs(page, limit);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

// Get a single blog post by ID
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    res.status(200).json({ status: "success", data: blog });
  } catch (err) {
    next(err);
  }
};

// Update a blog post
export const updateBlog = async (req, res, next) => {
  try {
    const blog = await blogService.updateBlog(
      req.params.id,
      req.body,
      req.user,
    );
    res.status(200).json({ status: "success", data: blog });
  } catch (err) {
    next(err);
  }
};

// Delete a blog post
export const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlog(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Blog deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
