require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.prefix = '?';
client.prefixCommands = new Collection();
client.slashCommands = new Collection();

// Load prefix commands
const commandsPath = path.join(__dirname, 'commands');
const prefixCategories = fs.readdirSync(commandsPath);

for (const category of prefixCategories) {
  const commandFiles = fs.readdirSync(path.join(commandsPath, category)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${category}/${file}`);
    client.prefixCommands.set(command.name, command);
  }
}

// Load slash commands
const slashPath = path.join(__dirname, 'slashCommands');
const slashCategories = fs.readdirSync(slashPath);

for (const category of slashCategories) {
  const commandFiles = fs.readdirSync(path.join(slashPath, category)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./slashCommands/${category}/${file}`);
    if ('data' in command && 'execute' in command) {
      client.slashCommands.set(command.data.name, command);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.TOKEN);
