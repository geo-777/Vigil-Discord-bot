const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');

module.exports = {
  name: 'kick',
  description: 'Kicks out the member from the server.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'kick', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    // Check bot's permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | I do not have the \`Kick Members\` permission to execute this command.`
      );
    }

    // Check user's permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You do not have the \`Kick Members\` permission to execute this command.`
      );
    }

    // Get the mentioned member
    const member = message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please \`mention\` a valid user in this server.\n\`Command Usage : ?kick @user {optional reason}\``
      );
    }

    // Don't allow kicking yourself or the bot
    if (member.id === message.author.id) {
      return message.channel.send("😐 You can't kick yourself, chill.");
    }
    if (member.id === message.client.user.id) {
      return message.channel.send("🔪 I ain't gonna kick myself Lil bro.");
    }

    // Don't allow kicking the server owner
    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | I cannot kick the server owner.`);
    }

    // Reason for kick
const reason = `${args.slice(1).join(' ') || 'No reason provided'}. Kicked by ${message.author.tag}.`;

    try {
      await member.kick(reason);
      return message.channel.send(`${message.client.TickEmoji}| Successfully kicked <@${member.id}>.\n\`Reason : ${reason}\``);
    } catch (err) {
      if (err.code === 50013) {
        return message.channel.send(
          `${message.client.ErrorEmoji} | Role Hierarchy prevents me from kicking <@${member.id}>.\n\`Fix issue by providing me a higher role.\``
        );
      }

      console.error('Kick failed:', err);
      return message.channel.send(`${message.client.ErrorEmoji} | Failed to kick the member due to an unexpected error.`);
    }
  },
};
