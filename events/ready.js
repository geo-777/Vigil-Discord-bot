const {ActivityType} = require("discord.js");

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    
    const guildCount = client.guilds.cache.size; 
    // setting activity status to playing
    client.user.setPresence({
      activities:[
        {
          name:`${guildCount} servers.`,
          type: ActivityType.Watching
        }
      ],
      status:"idle"
    })
  },
};
