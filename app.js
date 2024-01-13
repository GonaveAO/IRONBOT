
const axios = require('axios')

const fs = require('fs');
const moment = require('moment');
var CryptoJS = require("crypto-js");
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
module.exports.Gclient = client;
const API = require(`./includes/api.js`);
const { token, commandModules, prefix, discordServerId } = require('./includes/config.json');
const con = require(`./includes/db.js`);
//const settings = require(`./commands/tools/settings.js`);


client.login(token)


client.commands = new Discord.Collection();
commandModules.forEach(thisModule => {
    const commandFiles = fs.readdirSync('./commands/' + thisModule).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${thisModule}/${file}`);
        // set a new item in the Collection
        // with the key as the command name and the value as the exported module
        console.log("Loading module: " + command.name)
        client.commands.set(command.name, command);
    }

})

console.log("Loaded commands: ")
console.log(client.commands)

async function loadOnStart() {
    //await client.commands.get("settings").execute("load", "")
    //client.commands.get("task").execute("all", ["all"])
}
client.on('rateLimit', (rateLimitInfo) => {
    console.log(rateLimitInfo)

})
client.on('debug', (info) => {
    var d = Date(Date.now());
    var a = d.toString()
    console.log(a + " | " + info)
});
client.once('ready', async () => {

    var server = await client.guilds.cache.get(discordServerId)
    await server.members.fetch()
    console.log('Ready!');
    //loadOnStart();
    //alliances = settings.alliances
    //allianceNames = settings.allianceNames


});
async function intervalFunc() {
    var t = 1;//Date.now();

    const [result, fields] = await con.execute(`SELECT * FROM bot_register`);
    if (result.length > 0) {
        var discordGuildId = "478172230501793797";
        var discordGuild = client.guilds.cache.get(discordGuildId);
        var gRoles = discordGuild.roles
        for (var i = 0; i < result.length; i++) {

            const discordMemberId = result[i].discordId;
            console.log(result[i].discordId)
            //console.log(discordMember)
            var playerId = result[i].playerId;
            var data = await API.getUserData(playerId)

            //if (IsJsonString(data)) {
            //    data = JSON.parse(data);
            //} else {
            //    return;
            //}
            var currentGuild = data.GuildId;
            var currentId = data.Id;
            console.log(data)
            const [result2, fields2] = await con.execute(`SELECT * FROM bot_register WHERE playerId = "${currentId}"`);
            if (result2.length > 0) {
                var guildId = result2[0].guildId;
                var _playerName = result2[0].playerName;
                var discordInfo = result2[0].discordName + "#" + result2[0].discordTag;
                console.log(`Checking: current: ${currentId} in db: ${result[i].guildId}`)

                const discordMember = await discordGuild.members.cache.get(discordMemberId);
                if (discordMember) {
                    if (discordMember.roles.cache.find(x => x.name === "Bypass")) {
                        return;
                    }
                    if (currentGuild != guildId && currentGuild != "" && currentGuild != null && (discordMember.roles.cache.find(x => x.name === "Iron Hand") || discordMember.roles.cache.find(x => x.name === "Iron_Hand") || discordMember.roles.cache.find(x => x.name === "Iron Beasts")) ) {
                        console.log("==================")
                        console.log(discordMember)

                        console.log(data)
                        // discordMember.roles.set([]);
                        const embed = new Discord.MessageEmbed()
                            .setAuthor("Janitor")
                            .setTitle(`Warning! Guild missmatch! Removing perms!`)
                            .setColor('#3f51b5')
                            .addField("Player", `<@${discordMemberId}> | ${discordInfo} | IGN: ${_playerName}`, true)
                            .addField("Guilds", `IS: [${currentGuild}](https://albiononline.com/en/killboard/guild/${currentGuild}) | WAS: [${guildId}](https://albiononline.com/en/killboard/guild/${guildId})`, true)





                        client.channels.cache.get("885099633976688650").send({ embeds: [embed] })

                        await discordMember._roles.forEach(rolex => {
                            if (rolex != 647009173405564930 &&
                                rolex != 478853221276844032 &&
                                rolex != 882645323267326003 &&
                                rolex != 677856086589702144) {
                                let roleToBeRemoved = discordGuild.roles.cache.find(role => role.id === `${rolex}`);
                                console.log(roleToBeRemoved)
                                discordMember.roles.remove(roleToBeRemoved)

                            }
                        })


                    }

                } else {
                    console.log("no user: " + discordMemberId)
                }
            }

        }
    }
}
setInterval(intervalFunc, 7200000);


client.on('messageCreate', async message => {
    
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) {
        return;
    }
    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
    if (message.author.bot) { return }




});