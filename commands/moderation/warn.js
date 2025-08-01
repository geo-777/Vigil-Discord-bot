const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: 'warn',
  description: 'Warns a member from the server.',
  async execute(message, args) {
    const cooldown = 5000; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'warn', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    // Permissions check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You do not have the \`Moderate Members\` permission to execute this command.`
      );
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please \`mention\` a valid user.\n\`Command Usage : ?warn @user {optional reason}\``
      );
    }

    if (member.id === message.author.id) return message.channel.send("😐 You can't warn yourself.");
    if (member.id === message.client.user.id) return message.channel.send("🔪 You can't warn me bro.");
    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | You cannot warn the server owner.`);
    }

    // Role hierarchy check
    const targetRolePosition = member.roles.highest.position;
    const authorRolePosition = message.member.roles.highest.position;
    if ((targetRolePosition >= authorRolePosition) && message.author.id !== message.guild.ownerId) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You cannot warn a user with the same or higher role than yours.\n\`To warn them, obtain a higher role.\``
      );
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const filePath = path.join(__dirname, '..', '..', 'data', 'warns.json');

    // Main warn logic
    try {
      // Ensure file exists
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify({}));
      }

      // Read and parse
      let fileContent = await fs.readFile(filePath, 'utf-8');
      let warnData = JSON.parse(fileContent);

      // Init if server not present
      if (!warnData[message.guild.id]) {
        warnData[message.guild.id] = {};
      }

      const userData = warnData[message.guild.id];

      if (!userData[member.id]) {
        userData[member.id] = [1, [reason]];
      } else {
        userData[member.id][0] += 1;
        userData[member.id][1].push(reason);
      }

      // Write back
      await fs.writeFile(filePath, JSON.stringify(warnData, null, 2));

    } catch (err) {
      console.error(`Unexpected error while processing warn:`, err);
      return message.channel.send(
        `${message.client.ErrorEmoji} | An unexpected error occurred while processing the warning.`
      );
    }

    // Notify
    try {
      await member.send(`${message.client.WarnEmoji} | You have been warned in **${message.guild.name}** for: **${reason}**`);
      await message.channel.send(`${message.client.TickEmoji} | Successfully warned ${member.user.tag}.\n**Reason:** ${reason}`);
    } catch (err) {
      if (err.code === 50007) {
        await message.channel.send(`⚠️ | Warned ${member.user.tag}, but I couldn't DM them (DMs off or blocked).`);
      } else if (err.code === 50013) {
        await message.channel.send(`${message.client.ErrorEmoji} | I don't have permission to DM ${member.user.tag}.`);
      } else {
        console.error(`DM error while warning ${member.user.tag}:`, err);
        await message.channel.send(`${message.client.ErrorEmoji} | Unexpected error occurred while DMing ${member.user.tag}.`);
      }
    }
  },
};
