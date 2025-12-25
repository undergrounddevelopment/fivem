const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const config = require('../../config');

const commands = [
  new SlashCommandBuilder()
    .setName('decrypt')
    .setDescription('Decrypt FiveM resource (requires vouch only)')
    .addAttachmentOption(option => 
      option.setName('file')
        .setDescription('Upload your resource .zip or .fxap')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('cfx_key')
        .setDescription('CFX license key (optional)')
        .setRequired(false)
    ),
  
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your vouch status')
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.discord.token);
  
  try {
    console.log('Refreshing slash commands...');
    
    // Hapus semua command lama terlebih dahulu
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: [] }
    );
    console.log('🗑️ Old commands cleared');
    
    // Daftarkan command baru
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: commands }
    );
    console.log(`✅ ${commands.length} slash commands registered: /decrypt, /status`);
  } catch (error) {
    console.error('❌ Slash registration failed:', error);
  }
}

module.exports = {
  registerCommands
};
