const { PermissionsBitField } = require('discord.js');
const fs = require("fs");
const coolDownChecker=require("../../data/coolDown");
const path = require("path");
module.exports = {
  name: 'prefix',
  description: 'Sets a custom prefix for the respective server.',
  async execute(message, args) {
    const cooldown = 5000; // 5 seconds
    const remaining = coolDownChecker(message.author.id, "prefix", cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji}| You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }


    if(message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)){
        let prefix = args[0];
        if (prefix===undefined){
            await message.channel.send(`${message.client.ErrorEmoji} | You haven't specified the new prefix.\n\`Command Usage : ?prefix {new prefix}\``)
        }else{
            let guildId=message.guildId;
            try{
                const filePath = path.join(__dirname, '..', '..', 'data', 'customPrefix.json');
                
                
                message.client.prefixData[`${guildId}`]=prefix;

                fs.writeFileSync(filePath,JSON.stringify(message.client.prefixData));
                await message.channel.send(`${message.client.TickEmoji}| Server prefix has been set to \`${prefix}\`.\n\`New Prefix Usage : ${prefix}{Command name}\``)
            }catch(err){
                console.log(err);
            }
        }
        

        
    }else{
        await message.channel.send(`${message.client.ErrorEmoji} | You do not have the \`Manage Server\` permission to execute this command.`)
    }

  
    
  },
};
