const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');


module.exports = {
  name: 'snipe',
  description: 'Fetches a recently deleted message from the channel.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'snipe', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }

    const channelID = message.channel.id;
    const serverID = message.guild.id;
    const snipeData = message.client.SnipeData;

    if (!snipeData[serverID][channelID]){
        return message.channel.send(
        `${message.client.ErrorEmoji} | Unable to snipe recently deleted message.`

      );
    }else{
      const rawData = snipeData[serverID][channelID];
      let embed = new EmbedBuilder()
                      .setColor(0x3621FF)
                      .setTitle(`Last deleted message from <#${channelID}>`)
                      .setDescription(rawData[0])
                      .setAuthor({name:rawData[1],iconURL:rawData[2]})  
                      
      return message.channel.send(
        { embeds: [embed] }
      );
    }
  },
};
