/**
 * Discord notification helper — sends contact form messages to a Discord channel.
 * 
 * Uses Discord's channel webhook or REST API to post an embed notification
 * whenever someone submits the contact form on the website.
 * 
 * This module is imported by the web server (not the bot process),
 * so it uses the REST API directly with the bot token.
 */
const { REST, Routes, EmbedBuilder } = require('discord.js');

let rest = null;

/**
 * Initialize the REST client lazily.
 * @returns {REST|null} The REST client, or null if token is missing
 */
function getRestClient() {
  if (rest) return rest;

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.warn('[DISCORD] DISCORD_BOT_TOKEN not set — contact notifications disabled.');
    return null;
  }

  rest = new REST({ version: '10' }).setToken(token);
  return rest;
}

/**
 * Send a contact message notification to the configured Discord channel.
 * 
 * @param {Object} params
 * @param {string} params.message - The contact message content
 * @param {string} params.username - The sender's username
 * @param {string} params.senderIp - The sender's IP address
 * @param {string} params.timestamp - ISO timestamp of the message
 */
async function notifyContactMessage({ message, username, senderIp, timestamp }) {
  const channelId = process.env.DISCORD_NOTIFICATION_CHANNEL_ID;
  if (!channelId) {
    console.warn('[DISCORD] DISCORD_NOTIFICATION_CHANNEL_ID not set — skipping notification.');
    return;
  }

  const client = getRestClient();
  if (!client) return;

  const embed = new EmbedBuilder()
    .setTitle('New Contact Message')
    .setDescription(message.length > 2000 ? message.substring(0, 2000) + '...' : message)
    .addFields(
      { name: 'Sender IP', value: `\`${senderIp}\``, inline: true },
      { name: 'Received', value: timestamp || new Date().toISOString(), inline: true }
    )
    .setColor(0x0077be)
    .setTimestamp()
    .setFooter({ text: 'fakadoe.dev -- Contact Form' });

  try {
    await client.post(Routes.channelMessages(channelId), {
      body: {
        embeds: [embed.toJSON()]
      }
    });
    console.log('[DISCORD] Contact notification sent successfully.');
  } catch (err) {
    console.error('[DISCORD] Failed to send contact notification:', err.message);
  }
}

module.exports = { notifyContactMessage };
