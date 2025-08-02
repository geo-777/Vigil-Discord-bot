const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (message.partial) {
      try {
        await message.fetch();
      } catch (err) {
        console.error('Failed to fetch partial message:', err);
        return;
      }
    }
    //snipe data format
    // server id : {channel id : [message,author,avatar], channel id 2 : message ....}
    const filePath=path.join(__dirname,"..","data","snipe.json");
    let snipeData=client.SnipeData;

   if (!message.guild) return;

    let ChannelData={}
    if(snipeData[message.guild.id]){
      ChannelData=snipeData[message.guild.id]
    }
    ChannelData[message.channel.id]=[
      message.content || "[Embed/Unknown Content]",
      message.author.tag,
      message.author.displayAvatarURL()
    ];
    snipeData[message.guild.id]=ChannelData;
    client.SnipeData=snipeData;
    await fs.writeFile(filePath, JSON.stringify(snipeData, null, 2));
    
    console.log(client.SnipeData);
    console.log(`A message by ${message.author.tag} was deleted in ${message.channel.name}`);
    console.log(`Content: ${message.content}`);
  }
};
