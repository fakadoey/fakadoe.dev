const xss = require('xss');

/**
 * XSS sanitization options — strips all HTML tags and attributes
 * from user input to prevent cross-site scripting attacks.
 */
const xssOptions = {
  whiteList: {},          // Allow no HTML tags
  stripIgnoreTag: true,   // Strip all non-whitelisted tags
  stripIgnoreTagBody: ['script', 'style'], // Remove <script> and <style> content entirely
};

/**
 * Middleware that sanitizes all string values in req.body.
 * Applied before any POST route that accepts user input.
 */
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key], xssOptions);
      }
    }
  }
  next();
}

module.exports = { sanitizeInput };
