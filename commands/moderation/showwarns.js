const { PermissionsBitField,EmbedBuilder, Embed } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');
const fs = require("fs").promises;
const path = require("path");


module.exports = {
  name: 'showwarns',
  description: 'Shows all the stored warnings for a user.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'showwarns', cooldown);

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
        `${message.client.ErrorEmoji} | Please mention a valid user.\n\`Usage: ?showwarns @user\``
      );
    }


    if (member.id === message.client.user.id)
      return message.channel.send("🔪 I aint got no warnings, Lil bro.");
    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | The server owner cannot be warned.`);
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

      
      let data=warnData[message.guild.id][member.id][1];

      let embed=new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`Warnings of ${member.user.tag}`)
                    .setAuthor({name:"Vigil",iconURL:message.client.user.avatarURL()})
                    .setTimestamp()
                    .setFooter({text:member.user.tag,iconURL:member.user.avatarURL()});
      let i=1;
      let desc=``;
      for(let warning of data){
        desc = `${desc}\n${i}. ${warning}`;
        i++;
      }
      embed.setDescription(desc);


      return message.channel.send(
        { embeds: [embed] }
      );
    } catch (err) {
      console.error(`Error while clearing warnings:`, err);
      return message.channel.send(
        `${message.client.ErrorEmoji} | An error occurred while trying to fetch the warnings.`
      );
    }
  },
};
