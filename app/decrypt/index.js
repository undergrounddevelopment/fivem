const { Client, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config');
const { registerCommands } = require('./src/modules/commands');
const { handleInteraction } = require('./src/modules/handlers');
const { startServer } = require('./src/server');
const { cleanOldBackups } = require('./src/modules/backup');
const DiscordLogger = require('./src/modules/discord-logger');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 UDG V 6.0 Decrypt Bot - Main Entry Point
// Discord: https://discord.gg/ajUReRDKv2
// ═══════════════════════════════════════════════════════════════════════════

async function initializeApplication() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║          🔥 UDG V 6.0 Decrypt Bot - Starting Up 🔥         ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    console.log('💬 Discord: https://discord.gg/ajUReRDKv2\n');

    // Start web server
    await startServer();

    // Register Discord commands
    await registerCommands();

    // Clean old backups (30 days retention)
    cleanOldBackups(30);

    client.on('ready', async() => {
        console.log(`✅ Discord Bot logged in as ${client.user.tag}`);
        console.log(`🌐 Serving on: ${config.appurl}\n`);
        global.discordLogger = new DiscordLogger(client);
    });

    client.on('interactionCreate', async(interaction) => {
        try {
            await handleInteraction(interaction);
        } catch (error) {
            console.error('❌ Error handling interaction:', error);
        }
    });

    client.on('error', (error) => {
        console.error('❌ Discord client error:', error);
    });

    // Vouch system monitoring
    const { getVouchByMessageId, removeVouch, banUser } = require('./src/modules/vouch-system');
    
    client.on(Events.MessageDelete, async (message) => {
        if (message.channelId !== config.discord.vouchChannelId) return;
        
        const vouchData = getVouchByMessageId(message.id);
        if (vouchData && vouchData.active) {
            removeVouch(vouchData.userId);
            const banned = await banUser(client, vouchData.userId, 'Deleted vouch message');
            
            if (global.discordLogger) {
                await global.discordLogger.sendLog(
                    '⚠️ Vouch Deleted - User Banned',
                    '',
                    0xff0000,
                    [
                        { name: 'User ID', value: vouchData.userId, inline: true },
                        { name: 'Message ID', value: message.id, inline: true },
                        { name: 'Banned', value: banned ? 'Yes' : 'Failed', inline: true },
                        { name: 'Original Vouch', value: vouchData.content.substring(0, 100), inline: false },
                        { name: 'Posted At', value: new Date(vouchData.timestamp).toLocaleString(), inline: true },
                        { name: 'Deleted At', value: new Date().toLocaleString(), inline: true }
                    ]
                );
            }
            console.log(`⚠️ User ${vouchData.userId} banned for deleting vouch`);
        }
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.channelId !== config.discord.vouchChannelId) return;
        if (message.author.bot) return;
        
        const { addVouch } = require('./src/modules/vouch-system');
        addVouch(message.author.id, message.id, message.content);
        
        if (global.discordLogger) {
            await global.discordLogger.sendLog(
                '✅ New Vouch Posted',
                '',
                0x00ff00,
                [
                    { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Message ID', value: message.id, inline: true },
                    { name: 'Vouch Content', value: message.content.substring(0, 200), inline: false },
                    { name: 'Posted At', value: new Date().toLocaleString(), inline: true }
                ]
            );
        }
        console.log(`✅ Vouch registered for ${message.author.tag} (${message.author.id})`);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    await client.login(config.discord.token);
}

global.discordLogger = null;

initializeApplication().catch(console.error);
