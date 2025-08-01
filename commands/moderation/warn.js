const { PermissionsBitField } = require('discord.js');
const coolDownChecker = require('../../data/coolDown');
const fs = require("fs");
const path = require("path");


module.exports = {
  name: 'warn',
  description: 'Warns a member from the server.',
  async execute(message, args) {
    const cooldown = 2500; // 2.5 seconds
    const remaining = coolDownChecker(message.author.id, 'warn', cooldown);

    if (remaining > 0) {
      return message.channel.send(
        `${message.client.CoolDownEmoji} | You're on \`cooldown\`. Try again in \`${(remaining / 1000).toFixed(1)}s\`.`
      );
    }
    


    // Check user's permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | You do not have the \`Moderate Members\` permission to execute this command.`
      );
    }

    // Get the mentioned member
    const member = message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        `${message.client.ErrorEmoji} | Please \`mention\` a valid user in this server.\n\`Command Usage : ?warn @user {optional reason}\``
      );
    }

    if (member.id === message.author.id) {
      return message.channel.send("😐 You can't warn yourself, chill.");
    }
    if (member.id === message.client.user.id) {
      return message.channel.send("🔪 You can't warn me bro.");
    }

    if (member.id === message.guild.ownerId) {
      return message.channel.send(`${message.client.ErrorEmoji} | You cannot warn the server owner.`);
    }

    // Reason for kick
    const reason = args.slice(1).join(' ') || 'No reason provided';

    // compare role heirarchy
    const  targetRolePosition=member.roles.highest.position;
    const  authorRolePosition=message.member.roles.highest.position;
    if((targetRolePosition==authorRolePosition) && (message.author.id != message.guild.ownerId) ){
      return message.channel.send(`${message.client.ErrorEmoji} | You cannot warn a user having the same role as yours.\n\`Inorder to warn the user, obtain a higher role for yourself.\``);
    } else if((targetRolePosition>authorRolePosition) && (message.author.id != message.guild.ownerId) ){
      return message.channel.send(`${message.client.ErrorEmoji} | You cannot warn a user having a higher role than yours.\n\`Inorder to warn the user, obtain a higher role for yourself.\``);
    }
    //main logic
    try{
      // format for warns 
      // server id : {user1 : [no of warnings,[warnings]] , user2 : [no of warnings,[warnings]]}
      // warnings will be  in nested lists as strings.
      const filePath=path.join(__dirname,"..","..","data","warns.json");
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
      }

      let warnData=JSON.parse(fs.readFileSync(filePath));
      
      if(!warnData[message.guild.id]){
        let userData={}
        userData[member.id]=[1,[reason]];
        warnData[message.guild.id]=userData;
        console.log(warnData);
        fs.writeFileSync(filePath,JSON.stringify(warnData));
      }else{
        let userData=warnData[message.guild.id];
        if(!userData[member.id]){
          userData[member.id]=[1,[reason]];
        }else{
          let arrayDataOfUsers=userData[member.id];
          arrayDataOfUsers[1].push(reason);
          arrayDataOfUsers[0]+=1;
        }
        warnData[message.guild.id]=userData;
        console.log(warnData);
        fs.writeFileSync(filePath,JSON.stringify(warnData));
      }
      


    }catch(err){
        console.error(`Unexpected error while warning ${member.user.tag}:`, err);
        await message.channel.send(
          `${message.client.ErrorEmoji} | An unexpected error occurred while trying to warn ${member.user.tag}.`
        );

    }
    try {
      await member.send(`${message.client.WarnEmoji} | You have been warned in **${message.guild.name}** for: **${reason}**`);
      await message.channel.send(`${message.client.TickEmoji} | Successfully warned ${member.user.tag}.\n**Reason:** ${reason}`);
    } catch (err) {
      if (err.code === 50007) { // Cannot send messages to this user (DMs off or blocked bot)
        await message.channel.send(
          `⚠️ | ${member.user.tag} has been warned, but I couldn't DM them (they may have DMs off).`
        );
      } else if (err.code === 50013) { // Missing Permissions
        await message.channel.send(
          `${message.client.ErrorEmoji} | I don't have permission to DM ${member.user.tag}.`
        );
      } else if (err.code === 50035) { // Invalid Form Body (usually won't happen here but safe to check)
        await message.channel.send(
          `${message.client.ErrorEmoji} | Something went wrong with the message format while warning ${member.user.tag}.`
        );
      } else {
        console.error(`Unexpected error while warning ${member.user.tag}:`, err);
        await message.channel.send(
          `${message.client.ErrorEmoji} | An unexpected error occurred while trying to warn ${member.user.tag}.`
        );
      }
    }

  },
};
