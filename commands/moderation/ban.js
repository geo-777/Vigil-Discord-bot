const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');

module.exports = {
  name: 'ban',
  description: 'Bans a member from the server.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'ban', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    // Check bot's permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | I do not have the \`Ban Members\` permission to execute this command.`
      );
    }

    // Check user's permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You do not have the \`Ban Members\` permission to execute this command.`
      );
    }

    // Get the mentioned member
    const member = message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please \`mention\` a valid user in this server.\n\`Command Usage : ?ban @user {optional reason}\``
      );
    }

    if (member.id === message.author.id) {
      return message.channel.send("😐 You can't ban yourself, calm down.");
    }

    if (member.id === message.client.user.id) {
      return message.channel.send("🔪 I ain't banning myself, bro.");
    }

    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | I cannot ban the server owner.`);
    }

    const reason = `${args.slice(1).join(' ') || 'No reason provided'}. Banned by ${message.author.tag}.`;

    try {
      await member.ban({ reason });
      return message.channel.send(`${message.client.TickEmoji}| Successfully banned <@${member.id}>.\n\`Reason : ${reason}\``);
    } catch (err) {
      if (err.code === 50013) {
        return message.channel.send(
          `${message.client.ErrorEmoji} | Role Hierarchy prevents me from banning <@${member.id}>.\n\`Fix issue by providing me a higher role.\``
        );
      }

      console.error('Ban failed:', err);
      return message.channel.send(`${message.client.ErrorEmoji} | Failed to ban the member due to an unexpected error.`);
    }
  },
};
