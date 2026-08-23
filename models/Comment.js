const { queryAll, queryOne, runStatement } = require('../config/database');

/**
 * Comment model — CRUD operations for the comments table.
 * Comments are anonymous by default ("Anonymous Diver").
 */
const Comment = {
  /**
   * Get all comments for a specific project, ordered by newest first.
   * @param {number} projectId - The project's ID
   */
  getByProjectId(projectId) {
    return queryAll(
      'SELECT * FROM comments WHERE project_id = ? ORDER BY timestamp DESC',
      [projectId]
    );
  },

  /**
   * Get all comments across all projects, with project title joined.
   * Used in admin dashboard.
   */
  getAllWithProject() {
    return queryAll(`
      SELECT comments.*, projects.title AS project_title, projects.slug AS project_slug
      FROM comments
      LEFT JOIN projects ON comments.project_id = projects.id
      ORDER BY comments.timestamp DESC
    `);
  },

  /**
   * Create a new comment.
   * @param {Object} data - { project_id, author, content }
   */
  create({ project_id, author, content }) {
    const authorName = (author && author.trim()) ? author.trim() : 'Anonymous Diver';
    const result = runStatement(
      'INSERT INTO comments (project_id, author, content) VALUES (?, ?, ?)',
      [project_id, authorName, content]
    );
    return queryOne('SELECT * FROM comments WHERE id = ?', [result.lastInsertRowid]);
  },

  /**
   * Delete a comment by ID.
   * @param {number} id - The comment's ID
   */
  delete(id) {
    return runStatement('DELETE FROM comments WHERE id = ?', [id]);
  },

  /**
   * Count total comments.
   */
  count() {
    const row = queryOne('SELECT COUNT(*) as total FROM comments');
    return row ? row.total : 0;
  }
};

module.exports = Comment;
