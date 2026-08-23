const Comment = require('../models/Comment');
const Project = require('../models/Project');

/**
 * Comment controller — handles anonymous comment submission.
 */
const commentController = {
  /**
   * POST /comments/:projectId — Submit an anonymous comment
   */
  create(req, res) {
    const projectId = parseInt(req.params.projectId, 10);
    const { author, content } = req.body;

    // Validate project exists
    const project = Project.getById(projectId);
    if (!project) {
      return res.status(404).render('error', {
        title: 'Not Found',
        statusCode: 404,
        message: 'The project you\'re trying to comment on doesn\'t exist.',
        pageTitle: '404 — fakadoe.dev',
        currentPath: req.path
      });
    }

    // Validate content
    if (!content || !content.trim()) {
      return res.redirect(`/project/${project.slug}?error=Comment cannot be empty.`);
    }

    if (content.trim().length > 1000) {
      return res.redirect(`/project/${project.slug}?error=Comment is too long (max 1000 characters).`);
    }

    // Validate author length if provided
    if (author && author.trim().length > 50) {
      return res.redirect(`/project/${project.slug}?error=Name is too long (max 50 characters).`);
    }

    Comment.create({
      project_id: projectId,
      author: author || 'Anonymous Diver',
      content: content.trim()
    });

    res.redirect(`/project/${project.slug}?success=Comment posted successfully!`);
  }
};

module.exports = commentController;
