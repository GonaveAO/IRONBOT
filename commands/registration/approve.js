const con = require(`../../includes/db.js`);
const Discord = require('discord.js');
const API = require(`../../includes/api.js`);
const { roles } = require(`../../includes/config.json`);


module.exports = {
    name: 'approve',
    description: 'Approve player',
    async execute(message, args) {


        if (!message.member.roles.cache.find(x => x.name == "Approve")) {
            message.reply("You are not authorized to use this command!")
            return;
        }

        if (typeof args[0] === 'undefined') {
            return;
        }
       
        const user = await API.getUserFromMention(args[0]);
        if (!user) {
            return message.reply("Please use @mention")
        }
        let role = await message.guild.roles.cache.find(x => x.name == "Silver Member");
        let discordMember = await message.guild.members.cache.get(user.id)
        discordMember.roles.add(role).then(y => {
            // discordMember.roles.add(roleName).then(x => {
            message.reply(`Welcome to Iron Hand. \nPlease !register in <#885099666113462332> after a couple of hours to get permanent perms to our discord. If you aren't already, please make sure you're in ARCH discord. Link can be found here <#880178518942687302>. Enjoy your time here :heart: (If you're new to ARCH, make sure to read the rules at <#880178880273604688> & <#880178770328317953>).`)
            // })
        })

    },
};

