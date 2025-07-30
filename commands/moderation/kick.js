const { PermissionsBitField } = require('discord.js');
const coolDownChecker=require("../../data/coolDown");

module.exports = {
  name: 'kick',
  description: 'Kicks out the member from the server.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, "kick", cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji}| You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }


    if(!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)){
        return await message.channel.send(`${message.client.ErrorEmoji} | You do not have the \`Kick Members\` permission to execute this command.`)
    }


  },
};
