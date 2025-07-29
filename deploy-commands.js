require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];

const slashPath = path.join(__dirname, 'slashCommands');
const slashCategories = fs.readdirSync(slashPath);

for (const category of slashCategories) {
  const commandFiles = fs.readdirSync(path.join(slashPath, category)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./slashCommands/${category}/${file}`);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    const isGlobal = process.argv.includes('--global');
    const route = isGlobal
      ? Routes.applicationCommands(process.env.CLIENT_ID)
      : Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);

    console.log(`🚀 Deploying ${isGlobal ? 'global' : 'guild'} commands...`);
    await rest.put(route, { body: commands });
    console.log('✅ Slash commands deployed.');
  } catch (error) {
    console.error(error);
  }
})();
