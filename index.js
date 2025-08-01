require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,                // Server info, roles, etc.
    GatewayIntentBits.GuildMessages,         // For message-based commands and logging
    GatewayIntentBits.MessageContent,        // To read the actual message content
    GatewayIntentBits.GuildMembers,          // For moderation (ban/kick), member join/leave
    GatewayIntentBits.GuildMessageReactions, // For reaction roles or moderation via reactions
    GatewayIntentBits.GuildPresences,        // Optional: For activity/status-based commands
    GatewayIntentBits.GuildIntegrations,     // Optional: If you integrate with external apps
    GatewayIntentBits.GuildVoiceStates,      // Optional: If you plan voice-related moderation or music
  ] ,
   partials: [Partials.Message, Partials.Channel]

});

client.prefix = '?';
client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.ErrorEmoji="<:error:1400009779182567476>";
client.TickEmoji="<:tick:1400014597733486673>";
client.CoolDownEmoji="<:cooldown:1400089192146669634>";
client.WarnEmoji="<:warn:1400713585310568498>";

console.log("⌚ Loading Prefix Data.");
const filePath = path.join(__dirname, "data", "customPrefix.json");
client.prefixData=JSON.parse(fs.readFileSync(filePath))
console.log(client.prefixData)
// Load prefix commands
console.log("⌚ Loading Prefix Commands.");
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
console.log("⌚ Loading Slash Commands.")
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
console.log("⌚ Loading Events.");
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

console.log("🗝️  Attempting login.")
client.login(process.env.TOKEN);
