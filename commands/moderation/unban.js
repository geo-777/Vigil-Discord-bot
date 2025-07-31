const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');

module.exports = {
  name: 'unban',
  description: 'Unbans a member from the server.',
  async execute(message, args) {
    const cooldown = 2500;
    const remaining = coolDownChecker(message.author.id, 'unban', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on cooldown. Try again in ${(remaining / 1000).toFixed(1)}s.`
      );
    }

    // Check bot permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | I need the 'Ban Members' permission to unban users.`
      );
    }

    // Check user permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You need the 'Ban Members' permission to use this command.`
      );
    }

    const rawInput = args[0];
    if (!rawInput) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please mention a user or provide a valid user ID.\nUsage: \`?unban <userId/mention> [reason]\``
      );
    }

    // Strip mention characters if present
    const userId = rawInput.replace(/[<@!>]/g, '');

    // Validate ID format (17-20 digit numeric)
    if (!/^\d{17,20}$/.test(userId)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | That doesn't look like a valid user ID.`
      );
    }

    // Prevent unbanning self or bot
    if (userId === message.author.id) {
      return message.channel.send("😐 You can't unban yourself, chill out.");
    }

    if (userId === message.client.user.id) {
      return message.channel.send("🔪 I ain't banned, chief.");
    }

    if (userId === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | The server owner isn't banned.`);
    }

    // Create reason string with default fallback
    const reason = args.slice(1).join(' ') || `No reason provided. Unbanned by ${message.author.tag}`;

    try {
      await message.guild.bans.remove(userId, `Unbanned by ${message.author.tag}: ${reason}`);
      return message.channel.send(
        `${message.client.TickEmoji} | Successfully unbanned <@${userId}>.`
      );
    } catch (err) {
      if (err.code === 10026) {
        return message.channel.send(
          `${message.client.ErrorEmoji} | That user is not currently banned.`
        );
      }

      console.error('Unban failed:', err);
      return message.channel.send(
        `${message.client.ErrorEmoji} | Something went wrong while trying to unban the user.`
      );
    }
  },
};
