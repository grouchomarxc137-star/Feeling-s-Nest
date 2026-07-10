import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Client, GatewayIntentBits, REST, Routes, MessageFlags, AttachmentBuilder } from 'discord.js';
import * as repo from './repo.js';
import { SESSION_STATUS } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOVE_VEST_DIR = path.join(__dirname, '..', 'assets', 'lovevest');

const RESET_LINK_MESSAGE = (url) =>
  `🌿 **A reset session has started.**\nJoin here: ${url}\n\nNo messages will stick in any channel until the session is complete — the summary will be posted here when it's done.`;

const LOCKDOWN_WARNING =
  '🔒 **Reset protocol active.** Every message sent here (and everywhere else) will be deleted until this session is resolved.';

let client = null;
let lockState = null; // { sessionId } | null

function randomLoveVestImage() {
  const files = fs.readdirSync(LOVE_VEST_DIR).filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f));
  if (files.length === 0) return null;
  const pick = files[Math.floor(Math.random() * files.length)];
  return path.join(LOVE_VEST_DIR, pick);
}

function sendLoveVest(channel) {
  const imagePath = randomLoveVestImage();
  if (!imagePath) return Promise.resolve();
  return channel.send({ files: [new AttachmentBuilder(imagePath)] });
}

async function registerCommands(clientId, guildId, token) {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: [
      {
        name: 'triggered',
        description: 'Start the reset protocol: silence the server and post a session link',
      },
      {
        name: 'cancel',
        description: 'Emergency stop: end the reset protocol immediately without waiting for the session',
      },
      {
        name: 'lovevest',
        description: 'Post the love vest picture in this channel',
      },
    ],
  });
}

export function startDiscordBot() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;
  const resetChannelId = process.env.DISCORD_CHANNEL_ID;
  const baseUrl = process.env.PUBLIC_BASE_URL;

  if (!botToken || !clientId || !guildId || !resetChannelId || !baseUrl) {
    console.log(
      '[discord] DISCORD_BOT_TOKEN/DISCORD_CLIENT_ID/DISCORD_GUILD_ID/DISCORD_CHANNEL_ID/PUBLIC_BASE_URL not fully set, skipping bot startup'
    );
    return;
  }

  client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

  client.once('ready', async () => {
    console.log(`[discord] bot logged in as ${client.user.tag}`);
    try {
      await registerCommands(clientId, guildId, botToken);
      console.log('[discord] registered /triggered, /cancel, /lovevest commands');
    } catch (err) {
      console.error('[discord] failed to register commands:', err.message);
    }
  });

  // While a reset protocol is active, delete every human message anywhere in the
  // guild the instant it's posted — this works regardless of who has admin, unlike
  // channel permission overwrites (which Discord always lets the owner/admins bypass).
  client.on('messageCreate', async (message) => {
    if (!lockState) return;
    if (message.guildId !== guildId) return;
    if (message.author.bot) return;
    // Let the active session's own join link through, so either of you can
    // reshare/paste it without it getting wiped along with everything else.
    if (message.content.includes(`${baseUrl}/s/${lockState.sessionId}`)) return;
    try {
      await message.delete();
    } catch (err) {
      console.error(`[discord] failed to delete message ${message.id}:`, err.message);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.guildId !== guildId) return;

    if (interaction.commandName === 'lovevest') {
      await interaction.reply({ content: 'here you go 💚', flags: MessageFlags.Ephemeral });
      try {
        await sendLoveVest(interaction.channel);
      } catch (err) {
        console.error('[discord] failed to send love vest image:', err.message);
      }
      return;
    }

    if (interaction.commandName === 'triggered') {
      if (lockState) {
        await interaction.reply({ content: 'A reset protocol is already in progress.', flags: MessageFlags.Ephemeral });
        return;
      }

      await interaction.reply({ content: 'Starting the reset protocol…', flags: MessageFlags.Ephemeral });

      try {
        const session = repo.createSession();
        lockState = { sessionId: session.id };

        await interaction.channel.send(LOCKDOWN_WARNING);
        await sendLoveVest(interaction.channel);

        const resetChannel = await client.channels.fetch(resetChannelId);
        await resetChannel.send(RESET_LINK_MESSAGE(`${baseUrl}/s/${session.id}`));
      } catch (err) {
        console.error('[discord] failed to start reset protocol:', err.message);
        lockState = null;
      }
      return;
    }

    if (interaction.commandName === 'cancel') {
      if (!lockState) {
        await interaction.reply({ content: 'Nothing is active right now.', flags: MessageFlags.Ephemeral });
        return;
      }

      const { sessionId } = lockState;
      lockState = null;

      await interaction.reply({ content: '🚨 Emergency cancel — reset protocol ended.', flags: MessageFlags.Ephemeral });

      const currentStatus = repo.getSession(sessionId)?.status;
      if (currentStatus && currentStatus !== SESSION_STATUS.COMPLETED && currentStatus !== SESSION_STATUS.CANCELLED) {
        repo.setSessionStatus(sessionId, SESSION_STATUS.CANCELLED);
      }
      console.log(`[discord] emergency-cancelled session ${sessionId}`);
      return;
    }
  });

  client.login(botToken);
}

export function unlockAfterSession(sessionId) {
  if (!lockState || lockState.sessionId !== sessionId) return;
  lockState = null;
  console.log(`[discord] session ${sessionId} finished, reset protocol ended`);
}
