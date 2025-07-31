const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');

module.exports = {
  name: 'purge',
  description: 'Clears a set number of messages.',
  async execute(message, args) {
    const cooldown = 8000;
    const remaining = coolDownChecker(message.author.id, 'purge', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You do not have the \`Manage Messages\` permission to execute this command.`
      );
    }

    const amount = Number(args[0]) || 100;

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please enter a number between \`1\` and \`100\` for the number of messages to delete.`
      );
    }

    try {
      await message.channel.bulkDelete(amount, true);
      return message.channel.send(
        `${message.client.TickEmoji} | Successfully deleted \`${amount}\` messages.`
      ).then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
    } catch (err) {
      console.error('Purge failed:', err);
      return message.channel.send(
        `${message.client.ErrorEmoji} | An error occurred while deleting messages.`
      );
    }
  },
};
