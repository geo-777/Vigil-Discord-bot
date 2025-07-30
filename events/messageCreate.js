module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    // Ignore bot messages
    if (message.author.bot) return;

    var prefix = client.prefix;
    var server = message.guildId;

    let prefixData = client.prefixData;
    if (client.prefixData[server]) {
      prefix = client.prefixData[server];
    }
    // ==========  Respond to normal messages (no prefix) ==========
    const content = message.content.toLowerCase();

    // Simple text response example
  
   

    // ==========  Handle prefix-based commands ==========
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/); //  /+/ means one or more white spaces
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(err);
      await message.reply(`${client.ErrorEmoji} | An \`error\` occurred while executing this command.`);
    }
  },
};
