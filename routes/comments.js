const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { spamLimiter } = require('../config/rateLimiter');
const { sanitizeInput } = require('../middleware/sanitize');

// Submit anonymous comment — spam limited and sanitized
router.post('/:projectId', spamLimiter, sanitizeInput, commentController.create);

module.exports = router;
