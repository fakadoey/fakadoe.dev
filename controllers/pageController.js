const Project = require('../models/Project');
const Comment = require('../models/Comment');
const ContactMessage = require('../models/ContactMessage');
const { marked } = require('marked');
const { notifyContactMessage } = require('../bot/notify');

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true
});

/**
 * Page controller — handles rendering of all public-facing pages.
 */
const pageController = {
  /**
   * GET / — Homepage with project grid
   */
  home(req, res) {
    const projects = Project.getVisible();
    res.render('index', {
      pageTitle: 'fakadoe.dev — Deep Water Portfolio',
      pageDescription: 'Portfolio and blog by fakadoe. Explore projects, read posts, and dive deeper.',
      projects,
      currentPath: '/'
    });
  },

  /**
   * GET /project/:slug — Single project view with comments
   */
  project(req, res) {
    const project = Project.getBySlug(req.params.slug);

    if (!project || project.is_hidden) {
      return res.status(404).render('error', {
        title: 'Not Found',
        statusCode: 404,
        message: 'This project has drifted into the abyss and cannot be found.',
        pageTitle: '404 — fakadoe.dev',
        currentPath: req.path
      });
    }

    const comments = Comment.getByProjectId(project.id);
    const renderedContent = marked(project.content);

    res.render('project', {
      pageTitle: `${project.title} — fakadoe.dev`,
      pageDescription: `${project.title} — A project by fakadoe.`,
      project,
      renderedContent,
      comments,
      currentPath: `/project/${project.slug}`,
      success: req.query.success || null,
      error: req.query.error || null
    });
  },

  /**
   * GET /contact — Contact form page
   */
  contactForm(req, res) {
    res.render('contact', {
      pageTitle: 'Contact — fakadoe.dev',
      pageDescription: 'Send a message to fakadoe.',
      currentPath: '/contact',
      success: req.query.success || null,
      error: req.query.error || null
    });
  },

  /**
   * POST /contact — Submit contact form
   */
  submitContact(req, res) {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.redirect('/contact?error=Message cannot be empty.');
    }

    if (message.trim().length > 2000) {
      return res.redirect('/contact?error=Message is too long (max 2000 characters).');
    }

    const senderIp = req.ip || req.connection.remoteAddress || 'unknown';

    ContactMessage.create({
      sender_ip: senderIp,
      message: message.trim()
    });

    // Send Discord notification (async, non-blocking)
    notifyContactMessage({
      message: message.trim(),
      senderIp,
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.error('[CONTACT] Discord notification failed:', err.message);
    });

    res.redirect('/contact?success=Message sent successfully. Thank you!');
  }
};

module.exports = pageController;
