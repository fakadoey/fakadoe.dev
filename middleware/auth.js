const jwt = require('jsonwebtoken');

/**
 * Authentication middleware — verifies JWT stored in HttpOnly cookie.
 * Protects admin routes. On failure, redirects to login page.
 */
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    // Clear invalid/expired token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return res.redirect('/admin/login');
  }
}

/**
 * API Bearer token authentication — verifies Discord webhook secret.
 * Used for the Discord bot integration pipeline.
 */
function requireApiToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7);

  if (token !== process.env.DISCORD_WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Invalid API token.' });
  }

  next();
}

module.exports = { requireAuth, requireApiToken };
