const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/sanitize');

// Public admin routes (no auth needed)
router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

// Protected admin routes — all require JWT auth
router.get('/', requireAuth, adminController.dashboard);

// Project management
router.post('/projects/create', requireAuth, sanitizeInput, adminController.createProject);
router.post('/projects/:id/edit', requireAuth, sanitizeInput, adminController.updateProject);
router.post('/projects/:id/toggle', requireAuth, adminController.toggleProject);
router.post('/projects/:id/delete', requireAuth, adminController.deleteProject);

// Comment moderation
router.post('/comments/:id/delete', requireAuth, adminController.deleteComment);

// Message management
router.post('/messages/:id/delete', requireAuth, adminController.deleteMessage);

module.exports = router;
