const con = require(`../../includes/db.js`);
const Discord = require('discord.js');
const API = require(`../../includes/api.js`);
const {roles } = require(`../../includes/config.json`);


module.exports = {
    name: 'kb',
    description: 'Player\'s card',
    async execute(message, args) {


        if (!message.member.roles.cache.find(x => x.name === roles.registered)) {
            message.reply("You are not authorized to use this command!")
            return;
        }

        if (typeof args[0] === 'undefined') {
            return;
        }
        console.log(args[0])
        const user = await API.getUserFromMention(args[0]);
        if (!user) {
            return message.reply("Please use @mention")
        }
        const [result, fields] = await con.execute(`SELECT * FROM bot_register WHERE discordId = ?`, [user.id]);
        if (result.length > 0) {
            var playerId = result[0].playerId;
            const PlayerInfo = await API.getUserData(playerId);
            let _playerName = PlayerInfo.Name;
            let _playerId = PlayerInfo.Id;
            let _playerGuildName = PlayerInfo.GuildName;
            let _playerGuildId = PlayerInfo.GuildId;
            let _allianceName = PlayerInfo.AllianceName;
            let _allianceId = PlayerInfo.AllianceId;
            let _playerPVP = PlayerInfo.KillFame;
            let _playerPVE = PlayerInfo.LifetimeStatistics.PvE.Total;
            let _playerDeath = PlayerInfo.DeathFame;
            let _playerRatio = PlayerInfo.FameRatio;
            const embed = new Discord.MessageEmbed()
                //  .setAuthor("Janitor", "https://www.iconninja.com/files/126/948/1016/recycle-bin-delete-remove-garbage-trash-icon.png")
                .setTitle(`Player Info `)
                .setDescription(`<@${user.id}> | IGN: ${_playerName}`)
                .setColor('#3f51b5')
                .addField("Stats", `
                                                    **Guild**: [${_playerGuildName}](https://albiononline.com/en/killboard/guild/${_playerGuildId})
                                                    **Alliance**: [${_allianceName}](https://albiononline.com/en/killboard/alliance/${_allianceId}) 
                                                    **Kill Fame**: ${_playerPVP.toLocaleString()}
                                                    **Death Fame**: ${_playerDeath.toLocaleString()}
                                                    **Ratio**: ${_playerRatio.toLocaleString()}
                                                    **PvE Fame**: ${_playerPVE.toLocaleString()}
                                    
 

                            `, true)
                .addField("Profiles", `
                                                    [Sigma](https://app.sigmacomputing.com/embed/2Fb3n6osB7MZ0psRKGqR6?name=${_playerName})
                                                    [MurderLedger](https://murderledger.com/players/${_playerName}/ledger)
                                                    [AO.com](https://albiononline.com/en/killboard/player/${_playerId})
                                                    [AO2D](https://www.albiononline2d.com/en/scoreboard/players/${_playerId})
                            `, true)

            message.reply({ embeds: [embed] })


        } else {
            return;
        }

    },
};

