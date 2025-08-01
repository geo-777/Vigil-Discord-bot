const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: 'clearwarns',
  description: 'Clears all stored warnings for a user.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'clearwarns', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on cooldown. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    // Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You need the \`Moderate Members\` permission to use this command.`
      );
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please mention a valid user.\n\`Usage: ?clearwarns @user\``
      );
    }

    if (member.id === message.author.id)
      return message.channel.send("😐 You can't clear your own warnings.");
    if (member.id === message.client.user.id)
      return message.channel.send("🔪 You can never clear mine, bro.");
    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | You can't clear warnings for the server owner.`);
    }

    // Role hierarchy check
    const targetRolePosition = member.roles.highest.position;
    const authorRolePosition = message.member.roles.highest.position;
    if (targetRolePosition >= authorRolePosition && message.author.id !== message.guild.ownerId) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You can't clear warnings for someone with an equal or higher role.\n` +
        `Get a higher role to do that.`
      );
    }

    const filePath = path.join(__dirname, '..', '..', 'data', 'warns.json');

    try {
      // Ensure file exists
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify({}));
      }

      // Read and parse
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const warnData = JSON.parse(fileContent);

      if (!warnData[message.guild.id] || !warnData[message.guild.id][member.id]) {
        return message.channel.send(
          `${message.client.ErrorEmoji} | This user has no recorded warnings.`
        );
      }

      // Clear warnings
      warnData[message.guild.id][member.id] = [0, []];

      // Write back
      await fs.writeFile(filePath, JSON.stringify(warnData, null, 2));

      return message.channel.send(
        `${message.client.TickEmoji} | Successfully cleared all warnings for **${member.user.tag}**.`
      );
    } catch (err) {
      console.error(`Error while clearing warnings:`, err);
      return message.channel.send(
        `${message.client.ErrorEmoji} | An error occurred while trying to clear the warnings.`
      );
    }
  },
};
