const Project = require('../models/Project');

/**
 * API controller — handles external API integrations.
 * Currently supports the Discord bot webhook for pushing content.
 */
const apiController = {
  /**
   * POST /api/webhooks/discord-push
   * Accepts JSON payload from Discord bot to create a new project.
   * Authentication via Bearer token (DISCORD_WEBHOOK_SECRET).
   *
   * Expected payload: { title: string, content: string, tags: string[] }
   */
  discordPush(req, res) {
    const { title, content, tags } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Missing or invalid "title" field.' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Missing or invalid "content" field.' });
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ error: '"tags" must be an array of strings.' });
    }

    // Generate slug from title
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Validate tag entries
    const tagArray = (tags || []).map(t => {
      if (typeof t !== 'string') return String(t);
      return t.trim();
    }).filter(t => t.length > 0);

    try {
      const project = Project.create({
        title: title.trim(),
        slug,
        content: content.trim(),
        tags: tagArray
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully via Discord push.',
        project: {
          id: project.id,
          title: project.title,
          slug: project.slug,
          tags: project.tags,
          published_at: project.published_at
        }
      });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          error: 'A project with that slug already exists.',
          slug
        });
      }

      console.error('[API] Discord push error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = apiController;
