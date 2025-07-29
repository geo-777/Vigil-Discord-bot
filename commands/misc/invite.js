module.exports = {
  name: 'invite',
  description: 'Sends the bot invite link',
  execute(message, args) {
    const clientId = message.client.user.id;
    const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

    message.reply(`🔗 Invite me using this link: ${inviteURL}`);
  },
};
