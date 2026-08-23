const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 * Applied to all routes as baseline DDoS protection.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  handler: (req, res, next, options) => {
    res.status(429).render('error', {
      title: 'Rate Limited',
      statusCode: 429,
      message: 'You\'ve made too many requests. Please wait a few minutes before trying again.',
      pageTitle: 'Rate Limited — fakadoe.dev',
      currentPath: req.path
    });
  }
});

/**
 * Spam limiter: 3 POST requests per hour per IP.
 * Applied specifically to comment submissions and contact form.
 */
const spamLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission limit reached. Please try again in an hour.' },
  handler: (req, res, next, options) => {
    // For AJAX/API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(429).json({ error: 'Submission limit reached. Please try again in an hour.' });
    }
    // For form submissions — redirect back with error
    const referer = req.get('Referer') || '/';
    return res.status(429).render('error', {
      title: 'Slow Down',
      statusCode: 429,
      message: 'You\'ve reached the submission limit (3 per hour). Please try again later.',
      pageTitle: 'Submission Limited — fakadoe.dev',
      currentPath: req.path
    });
  }
});

module.exports = { globalLimiter, spamLimiter };
