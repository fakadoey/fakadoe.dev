/**
 * Deploy slash commands to Discord.
 * 
 * Run once after changes to command definitions:
 *   npm run bot:deploy
 * 
 * Required env vars: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID
 */
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('post-project')
    .setDescription('Create a new project on fakadoe.dev via a form')
    .toJSON()
];

async function deploy() {
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    console.error('[DEPLOY] Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in .env');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('[DEPLOY] Registering slash commands...');
    
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log(`[DEPLOY] Successfully registered ${data.length} command(s).`);
  } catch (err) {
    console.error('[DEPLOY] Failed to register commands:', err);
    process.exit(1);
  }
}

deploy();
