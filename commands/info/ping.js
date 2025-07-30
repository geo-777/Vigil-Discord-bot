const coolDownChecker = require("../../data/coolDown.js");

module.exports = {
  name: 'ping',
  description: 'Replies with Pong!',
  execute(message, args) {
    const cooldown = 5000; // 5 seconds
    const remaining = coolDownChecker(message.author.id, "ping", cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji}| You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    message.reply('🏓 Pong! (Prefix)');
  },
};
