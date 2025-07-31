const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');

module.exports = {
  name: 'warn',
  description: 'Warns a member from the server.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'warn', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }



    // Check user's permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You do not have the \`Moderate Members\` permission to execute this command.`
      );
    }

    // Get the mentioned member
    const member = message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please \`mention\` a valid user in this server.\n\`Command Usage : ?warn @user {optional reason}\``
      );
    }

    if (member.id === message.author.id) {
      return message.channel.send("😐 You can't warn yourself, chill.");
    }
    if (member.id === message.client.user.id) {
      return message.channel.send("🔪 I ain't gonna warn myself bro.");
    }

    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | I cannot warn the server owner.`);
    }

    // Reason for kick
    const reason = args.slice(1).join(' ') || 'No reason provided';

  


  },
};
