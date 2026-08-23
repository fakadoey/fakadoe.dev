const { queryAll, queryOne, runStatement } = require('../config/database');

/**
 * Project model — CRUD operations for the projects table.
 * Projects represent modular portfolio entries or blog posts.
 */
const Project = {
  /**
   * Get all projects (including hidden), ordered by newest first.
   */
  getAll() {
    const rows = queryAll('SELECT * FROM projects ORDER BY published_at DESC');
    return rows.map(Project._parseTags);
  },

  /**
   * Get only visible (non-hidden) projects, ordered by newest first.
   */
  getVisible() {
    const rows = queryAll('SELECT * FROM projects WHERE is_hidden = 0 ORDER BY published_at DESC');
    return rows.map(Project._parseTags);
  },

  /**
   * Get a single project by its URL slug.
   * @param {string} slug - The project's URL-friendly slug
   */
  getBySlug(slug) {
    const row = queryOne('SELECT * FROM projects WHERE slug = ?', [slug]);
    return row ? Project._parseTags(row) : null;
  },

  /**
   * Get a single project by ID.
   * @param {number} id - The project's ID
   */
  getById(id) {
    const row = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    return row ? Project._parseTags(row) : null;
  },

  /**
   * Create a new project.
   * @param {Object} data - { title, slug, content, tags }
   */
  create({ title, slug, content, tags = [] }) {
    const result = runStatement(
      'INSERT INTO projects (title, slug, content, tags) VALUES (?, ?, ?, ?)',
      [title, slug, content, JSON.stringify(tags)]
    );
    return Project.getById(result.lastInsertRowid);
  },

  /**
   * Update an existing project.
   * @param {number} id - The project's ID
   * @param {Object} fields - Fields to update { title, slug, content, tags }
   */
  update(id, { title, slug, content, tags }) {
    const existing = Project.getById(id);
    if (!existing) return null;

    runStatement(
      'UPDATE projects SET title = ?, slug = ?, content = ?, tags = ? WHERE id = ?',
      [
        title || existing.title,
        slug || existing.slug,
        content !== undefined ? content : existing.content,
        tags ? JSON.stringify(tags) : JSON.stringify(existing.tags),
        id
      ]
    );
    return Project.getById(id);
  },

  /**
   * Toggle the is_hidden flag on a project.
   * @param {number} id - The project's ID
   */
  toggleHidden(id) {
    runStatement('UPDATE projects SET is_hidden = CASE WHEN is_hidden = 0 THEN 1 ELSE 0 END WHERE id = ?', [id]);
    return Project.getById(id);
  },

  /**
   * Delete a project by ID. Cascades to delete associated comments.
   * @param {number} id - The project's ID
   */
  delete(id) {
    // Delete comments first (manual cascade since sql.js may not enforce FK cascades reliably)
    runStatement('DELETE FROM comments WHERE project_id = ?', [id]);
    return runStatement('DELETE FROM projects WHERE id = ?', [id]);
  },

  /**
   * Parse the JSON tags string into an array.
   * @private
   */
  _parseTags(row) {
    if (row && typeof row.tags === 'string') {
      try {
        row.tags = JSON.parse(row.tags);
      } catch {
        row.tags = [];
      }
    }
    return row;
  }
};

module.exports = Project;
