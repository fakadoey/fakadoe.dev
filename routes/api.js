const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { requireApiToken } = require('../middleware/auth');

// Discord bot webhook — push new projects via API
// Authentication: Bearer token matching DISCORD_WEBHOOK_SECRET
router.post('/webhooks/discord-push', requireApiToken, apiController.discordPush);

module.exports = router;
