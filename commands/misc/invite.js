const coolDownChecker=require("../../data/coolDown.js");
module.exports = {
  name: 'invite',
  description: 'Sends the bot invite link',
  execute(message, args) {
    const cooldown = 5000; // 5 seconds
    const remaining = coolDownChecker(message.author.id, "invite", cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji}| You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    const clientId = message.client.user.id;
    const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

    message.reply(`🔗 | Invite me using this link: ${inviteURL}`);
  },
};
