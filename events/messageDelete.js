
module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (message.partial) {
      try {
        await message.fetch();
      } catch (err) {
        console.error('Failed to fetch partial message:', err);
        return;
      }
    }

    console.log(`A message by ${message.author.tag} was deleted in ${message.channel.name}`);
    console.log(`Content: ${message.content}`);
  }
};
