const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { spamLimiter } = require('../config/rateLimiter');
const { sanitizeInput } = require('../middleware/sanitize');

// Homepage — project grid
router.get('/', pageController.home);

// Single project view with comments
router.get('/project/:slug', pageController.project);

// Contact form
router.get('/contact', pageController.contactForm);

// Contact form submission — spam limited and sanitized
router.post('/contact', spamLimiter, sanitizeInput, pageController.submitContact);

module.exports = router;
