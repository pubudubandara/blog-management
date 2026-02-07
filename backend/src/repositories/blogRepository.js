import db from "../config/db.js";

class BlogRepository {
  async create(blogData) {
    const { title, content, summary, author_id } = blogData;
    const [result] = await db.execute(
      "INSERT INTO blogs (title, content, summary, author_id) VALUES (?, ?, ?, ?)",
      [title, content, summary, author_id],
    );
    return result.insertId;
  }

  // Pagination Logic (LIMIT & OFFSET)
  async findAll(limit, offset) {
    const safeLimit = parseInt(limit) || 10;
    const safeOffset = parseInt(offset) || 0;

    const [rows] = await db.execute(
      `SELECT b.id, b.title, b.summary, b.created_at, u.username as author 
     FROM blogs b 
     JOIN users u ON b.author_id = u.id 
     ORDER BY b.created_at DESC 
     LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    );

    // Get total count for pagination metadata
    const [[{ total }]] = await db.execute(
      "SELECT COUNT(*) as total FROM blogs",
    );
    return { blogs: rows, total };
  }

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT b.*, u.username as author 
       FROM blogs b 
       JOIN users u ON b.author_id = u.id 
       WHERE b.id = ?`,
      [id],
    );
    return rows[0];
  }

  async update(id, data) {
    // Dynamic update query
    const fields = [];
    const values = [];
    if (data.title) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.content) {
      fields.push("content = ?");
      values.push(data.content);
    }
    if (data.summary) {
      fields.push("summary = ?");
      values.push(data.summary);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE blogs SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await db.execute(sql, values);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute("DELETE FROM blogs WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

export default new BlogRepository();
