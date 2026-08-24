/**
 * Discord Bot — fakadoe.dev integration
 * 
 * Features:
 * - /post-project slash command with modal form for creating projects
 * - Contact message notification function (imported by the web server)
 * 
 * Run with: npm run bot
 */
require('dotenv').config();
const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

const SITE_URL = process.env.SITE_URL || `http://localhost:${process.env.PORT || 8080}`;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ─── Ready Event ────────────────────────────────────────────────────
client.once(Events.ClientReady, (readyClient) => {
  console.log(`[BOT] Logged in as ${readyClient.user.tag}`);
  console.log(`[BOT] Serving ${readyClient.guilds.cache.size} guild(s)`);
  console.log(`[BOT] Site URL: ${SITE_URL}`);
});

// ─── Slash Command Handler ──────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  // Handle slash command
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'post-project') {
      return handlePostProjectCommand(interaction);
    }
  }

  // Handle modal submit
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'projectModal') {
      return handleProjectModalSubmit(interaction);
    }
  }
});

// ─── /post-project Command → Opens Modal ────────────────────────────
async function handlePostProjectCommand(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('projectModal')
    .setTitle('Create New Project');

  const titleInput = new TextInputBuilder()
    .setCustomId('projectTitle')
    .setLabel('Project Title')
    .setPlaceholder('My Awesome Project')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);

  const tagsInput = new TextInputBuilder()
    .setCustomId('projectTags')
    .setLabel('Tags (comma-separated)')
    .setPlaceholder('javascript, node.js, physics')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(500);

  const contentInput = new TextInputBuilder()
    .setCustomId('projectContent')
    .setLabel('Content (Markdown)')
    .setPlaceholder('# My Project\n\nWrite your project description in Markdown...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(4000);

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(tagsInput),
    new ActionRowBuilder().addComponents(contentInput)
  );

  await interaction.showModal(modal);
}

// ─── Modal Submit → POST to API ─────────────────────────────────────
async function handleProjectModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const title = interaction.fields.getTextInputValue('projectTitle');
  const tagsRaw = interaction.fields.getTextInputValue('projectTags');
  const content = interaction.fields.getTextInputValue('projectContent');

  // Parse tags
  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : [];

  try {
    const apiUrl = `${SITE_URL}/api/webhooks/discord-push`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DISCORD_WEBHOOK_SECRET}`
      },
      body: JSON.stringify({ title, content, tags })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const embed = new EmbedBuilder()
        .setTitle('Project Published')
        .setDescription(`**${data.project.title}** has been created successfully.`)
        .addFields(
          { name: 'Slug', value: data.project.slug, inline: true },
          { name: 'Tags', value: tags.length > 0 ? tags.join(', ') : 'None', inline: true }
        )
        .setColor(0x00e5ff)
        .setURL(`${SITE_URL}/project/${data.project.slug}`)
        .setTimestamp()
        .setFooter({ text: 'fakadoe.dev' });

      await interaction.editReply({ embeds: [embed] });
    } else {
      const errorEmbed = new EmbedBuilder()
        .setTitle('Creation Failed')
        .setDescription(data.error || 'An unknown error occurred.')
        .setColor(0xff5050)
        .setTimestamp()
        .setFooter({ text: 'fakadoe.dev' });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  } catch (err) {
    console.error('[BOT] Project creation error:', err);

    const errorEmbed = new EmbedBuilder()
      .setTitle('Connection Error')
      .setDescription(`Could not reach the API at ${SITE_URL}. Is the server running?`)
      .setColor(0xff5050)
      .setTimestamp()
      .setFooter({ text: 'fakadoe.dev' });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// ─── Login ──────────────────────────────────────────────────────────
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('[BOT] DISCORD_BOT_TOKEN is not set in .env');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
