require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { initDatabase } = require('./config/database');
const { globalLimiter } = require('./config/rateLimiter');

// Initialize Express
const app = express();

// ─── Security Headers ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── Global Rate Limiter ────────────────────────────────────────────
app.use(globalLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parser (for JWT HttpOnly cookies) ───────────────────────
app.use(cookieParser());

// ─── View Engine ────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Trust Proxy (for rate limiter IP detection behind reverse proxy) ─
app.set('trust proxy', 1);

// ─── Routes ─────────────────────────────────────────────────────────
const pageRoutes = require('./routes/pages');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.use('/', pageRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Lost in the Deep',
    statusCode: 404,
    message: 'The page you\'re looking for has sunk beyond reach.',
    pageTitle: '404 — fakadoe.dev',
    currentPath: req.path
  });
});

// ─── Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).render('error', {
    title: 'System Failure',
    statusCode: err.status || 500,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong in the depths.'
      : err.message,
    pageTitle: 'Error — fakadoe.dev',
    currentPath: req.path
  });
});

// ─── Initialize Database & Start Server ─────────────────────────────
const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`\n  ⚓ Deep Water Portfolio running on http://localhost:${PORT}`);
      console.log(`  🔒 Helmet security headers active`);
      console.log(`  🛡️  Rate limiting: 100 req/15min global, 3 POST/hr spam\n`);
    });
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err);
    process.exit(1);
  }
}

start();
