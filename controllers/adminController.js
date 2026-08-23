const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const ContactMessage = require('../models/ContactMessage');
const { queryOne } = require('../config/database');

/**
 * Admin controller — handles admin authentication and dashboard operations.
 */
const adminController = {
  /**
   * GET /admin/login — Render login page
   */
  loginPage(req, res) {
    // If already authenticated, redirect to dashboard
    const token = req.cookies && req.cookies.token;
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.redirect('/admin');
      } catch (_) {
        // Token invalid, show login
      }
    }

    res.render('admin/login', {
      pageTitle: 'Admin Login — fakadoe.dev',
      pageDescription: 'Admin login panel.',
      currentPath: '/admin/login',
      error: req.query.error || null
    });
  },

  /**
   * POST /admin/login — Authenticate admin credentials
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.redirect('/admin/login?error=Username and password are required.');
      }

      // Check username
      if (username !== process.env.ADMIN_USERNAME) {
        return res.redirect('/admin/login?error=Invalid credentials.');
      }

      // Check password against stored hash
      const adminRow = queryOne('SELECT password_hash FROM admin_credentials LIMIT 1');

      if (!adminRow) {
        // Fallback: compare against raw .env password (first run before seeding)
        if (password !== process.env.ADMIN_PASSWORD) {
          return res.redirect('/admin/login?error=Invalid credentials.');
        }
      } else {
        const valid = await bcrypt.compare(password, adminRow.password_hash);
        if (!valid) {
          return res.redirect('/admin/login?error=Invalid credentials.');
        }
      }

      // Issue JWT
      const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.redirect('/admin');
    } catch (err) {
      console.error('[ADMIN] Login error:', err);
      res.redirect('/admin/login?error=An error occurred during login.');
    }
  },

  /**
   * GET /admin/logout — Clear JWT cookie
   */
  logout(req, res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.redirect('/admin/login');
  },

  /**
   * GET /admin — Dashboard (auth-guarded)
   */
  dashboard(req, res) {
    const projects = Project.getAll();
    const comments = Comment.getAllWithProject();
    const messages = ContactMessage.getAll();

    res.render('admin/dashboard', {
      pageTitle: 'Command Center — fakadoe.dev',
      pageDescription: 'Admin dashboard.',
      currentPath: '/admin',
      projects,
      comments,
      messages,
      projectCount: projects.length,
      commentCount: comments.length,
      messageCount: messages.length,
      success: req.query.success || null,
      error: req.query.error || null
    });
  },

  /**
   * POST /admin/projects/create — Create a new project (auth-guarded)
   */
  createProject(req, res) {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.redirect('/admin?error=Title and content are required.');
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Parse tags (comma-separated string to array)
    const tagArray = tags
      ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    try {
      Project.create({ title, slug, content, tags: tagArray });
      res.redirect('/admin?success=Project created successfully!');
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.redirect('/admin?error=A project with that slug already exists.');
      }
      console.error('[ADMIN] Create project error:', err);
      res.redirect('/admin?error=Failed to create project.');
    }
  },

  /**
   * POST /admin/projects/:id/edit — Update a project (auth-guarded)
   */
  updateProject(req, res) {
    const id = parseInt(req.params.id, 10);
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.redirect('/admin?error=Title and content are required.');
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const tagArray = tags
      ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    try {
      Project.update(id, { title, slug, content, tags: tagArray });
      res.redirect('/admin?success=Project updated successfully!');
    } catch (err) {
      console.error('[ADMIN] Update project error:', err);
      res.redirect('/admin?error=Failed to update project.');
    }
  },

  /**
   * POST /admin/projects/:id/toggle — Toggle project visibility (auth-guarded)
   */
  toggleProject(req, res) {
    const id = parseInt(req.params.id, 10);
    Project.toggleHidden(id);
    res.redirect('/admin?success=Project visibility toggled.');
  },

  /**
   * POST /admin/projects/:id/delete — Delete a project (auth-guarded)
   */
  deleteProject(req, res) {
    const id = parseInt(req.params.id, 10);
    Project.delete(id);
    res.redirect('/admin?success=Project deleted.');
  },

  /**
   * POST /admin/comments/:id/delete — Delete a comment (auth-guarded)
   */
  deleteComment(req, res) {
    const id = parseInt(req.params.id, 10);
    Comment.delete(id);
    res.redirect('/admin?success=Comment deleted.');
  },

  /**
   * POST /admin/messages/:id/delete — Delete a contact message (auth-guarded)
   */
  deleteMessage(req, res) {
    const id = parseInt(req.params.id, 10);
    ContactMessage.delete(id);
    res.redirect('/admin?success=Message deleted.');
  }
};

module.exports = adminController;
