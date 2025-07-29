module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    // Ignore bot messages
    if (message.author.bot) return;

    const prefix = client.prefix;

    // ==========  Respond to normal messages (no prefix) ==========
    const content = message.content.toLowerCase();

    // Simple text response example
    if (content === 'hello') {
      return message.reply('Hello there! 👋');
    }

   

    // ==========  Handle prefix-based commands ==========
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(err);
      await message.reply('❌ | An `error` occurred while executing this command.');
    }
  },
};
