const con = require(`../../includes/db.js`);
//const settings = require(`../tools/settings.js`);
const Discord = require('discord.js');
const index = require("../../app.js");
const client = index.Gclient;
//var alliances = settings.alliances
//var allianceNames = settings.allianceNames
const API = require(`../../includes/api.js`);
const { channels, roles } = require(`../../includes/config.json`);
console.log(channels)

module.exports = {
    name: 'register',
    description: 'Registration command!',
    async execute(message2, args) {
        const message = message2;
        let regchanne = message.channel;
        var guildDefined = false;
        if (typeof args[0] === 'undefined') {
            return message.reply("Please provide IGN, example: !register ArchKiller");
        }
        if (typeof args[1] === 'undefined') {
            guildDefined = false;
        } else {
            guildDefined = true;
        }
        const playerName = args[0];
        const definedGuild = args.slice(1, args.length).join(" ");
        const newMessage = await message.reply({ content: `Trying to register your character \`${playerName}\`, please wait.`, failIfNotExists: false })
       
        
        const searchPlayerInfo = await API.searchPlayer(playerName);
        if (typeof searchPlayerInfo === 'undefined') {
            return newMessage.edit({ content: "Possible API issue, please try again in 5 minutes.", failIfNotExists: false });
        }
        let found = false
        //console.log(searchPlayerInfo)
        for (var i = 0; i < searchPlayerInfo.players.length; i++) {

            if (searchPlayerInfo.players[i].Name.toLowerCase() == playerName.toLowerCase()) {

                let reg_PlayerId = searchPlayerInfo.players[i].Id;
                const PlayerInfo = await API.getUserData(reg_PlayerId);
                let reg_PlayerName = PlayerInfo.Name;
                let reg_PlayerGuildName = PlayerInfo.GuildName;

                let reg_PlayerGuildId = PlayerInfo.GuildId;
                let reg_PlayerAllianceName = PlayerInfo.AllianceName;
                let reg_PlayerAllianceId = PlayerInfo.AllianceId;
                let reg_PlayerKillFame = PlayerInfo.KillFame;
                let reg_PlayerPveFame = PlayerInfo.LifetimeStatistics.PvE.Total;
                let reg_PlayerDeathFame = PlayerInfo.DeathFame;
                let reg_PlayerRatio = PlayerInfo.FameRatio;
                let reg_PlayerCrafting = PlayerInfo.LifetimeStatistics.Crafting.Total;
                let reg_PlayerGathering = PlayerInfo.LifetimeStatistics.Gathering.All.Total;
                const guildInfo = await API.getGuildInfo(reg_PlayerGuildId)
                reg_PlayerAllianceId = guildInfo.AllianceId;
                let reg_PlayerAllianceTag = guildInfo.AllianceTag;
                reg_PlayerAllianceName = guildInfo.AllianceTag;
                if (guildDefined) {
                    if (reg_PlayerGuildName.toLowerCase() != definedGuild.toLowerCase()) {
                        continue;
                    }
                }
                if (reg_PlayerGuildName == "") {
                    continue;
                }
                if (reg_PlayerGuildName == null) {
                    continue;
                }
                const isAllowed = await API.isPlayerFromGuild(reg_PlayerGuildId)
                if (!isAllowed) {
                    continue;
                }
                /*
                 * 
                 *  Blacklist Check
                 * 
                 */
                console.log(searchPlayerInfo.players[i])
                let isBlacklisted = false;
                let blacklistInfo = await API.checkBlacklist(playerName)
                console.log("blacklistinfo: ")
                if (blacklistInfo.isBl) {
                    isBlacklisted = true;
                    return newMessage.edit({ content: "Registration aborted. You have to get in touch with ARCH Police", failIfNotExists: false });
                }
                //await checkBlacklist(playerName, "unknown", "unknown", "unknown", function (blacklisted, blname, blid, blofficer, currentGuild, ally, datebl, reason) {
                //    if (blacklisted) {
                //        isBlacklisted = true;
                //        console.log(blacklisted, blname, blid, blofficer, currentGuild, ally, datebl, reason)
                //    }
                //}       

                /*
                 *
                 *  Alliance Check
                 *
                 */
                //let isInAlliance = await API.isPlayerFromAlliance(reg_PlayerAllianceId)
                //if (isInAlliance) {
                //    let testall = await API.getAllianceName(reg_PlayerAllianceId)
                //    console.log(reg_PlayerAllianceId + testall)
                //} else {
                //    return message.reply({ content: "It looks like your character is not in ARCH, if you want to join us please check guilds that have open recruitment: <#824039618856878091>", failIfNotExists: false })
                //}
                //reg_playerAllianceTag = await API.getAllianceName(reg_PlayerAllianceId)
                //if (reg_playerAllianceTag == "UNKNOWN") {
                //    console.log("-----------------------------------------")
                //    console.log(reg_PlayerAllianceId)
                //    console.log("-----------------------------------------")
                //}
                /*
                 *
                 *  Process registration
                 *
                 */

                let [rows, fields] = await con.query(`SELECT * FROM bot_register WHERE discordId = ?`, [message.author.id])
                if (rows.length > 0) {
                    return newMessage.edit({ content: "Your discord account is already linked to character. If you want to re-register type !unregister.", failIfNotExists: false })

                }

                [rows, fields] = await con.query(`SELECT * FROM bot_register WHERE playerId = ?`, [reg_PlayerId])
                if (rows.length > 0) {
                    let discordId = rows[0].discordId;
                    let discordName = rows[0].discordName;
                    let discordTag = rows[0].discordTag;
                    let playerName = rows[0].playerName;
                    let registerDate = rows[0].registerDate;
                    return newMessage.edit({ content: `Character \`${playerName}\` has been already registered by <@${discordId}>. Type !unregister to unregister account and then again !register IGN.`, failIfNotExists: false })
                }
                try {
                    const result = await con.query(`INSERT INTO bot_register (discordId, playerId, guildId,discordName, discordTag, playerName,guildName, allianceId, allianceName) VALUES (?,?,?,?,?,?,?,?,?)`, [message.author.id, reg_PlayerId, reg_PlayerGuildId, message.member.user.username, message.member.user.discriminator, reg_PlayerName, reg_PlayerGuildName, reg_PlayerAllianceId, reg_PlayerAllianceName])
                    console.log(result)
                    if (result[0].affectedRows > 0) {

                        newMessage.edit({ content: `Your character \`${reg_PlayerName}\` from \`${reg_PlayerGuildName}\` has been successfully registered. Make sure you read rules <#${channels.rules}>.`, failIfNotExists: false })
                        let color = "#545454";
                        if (reg_PlayerPveFame < 1000000) {
                            color = "#f44336"
                        }
                        const embed = new Discord.MessageEmbed()
                            //  .setAuthor("Janitor", "https://www.iconninja.com/files/126/948/1016/recycle-bin-delete-remove-garbage-trash-icon.png")
                            .setTitle(`New member registered`)
                            .setDescription(`<@${message.author.id}> | IGN: [${reg_PlayerName}](https://albiononline.com/en/killboard/player/${reg_PlayerId}) `)
                            .setColor(color)
                            .addField("Stats", `
                                                    **Guild**: [${reg_PlayerGuildName}](https://albiononline.com/en/killboard/guild/${reg_PlayerGuildId})
                                                    **Alliance**: [${reg_PlayerAllianceTag}](https://albiononline.com/en/killboard/alliance/${reg_PlayerAllianceId})
                                                    **Kill Fame**: ${reg_PlayerKillFame.toLocaleString()}
                                                    **Death Fame**: ${reg_PlayerDeathFame.toLocaleString()}
                                                    **Ratio**: ${reg_PlayerRatio.toLocaleString()}
                                                    **PvE Fame**: ${reg_PlayerPveFame.toLocaleString()}
                                                    **Crafting**: ${reg_PlayerCrafting.toLocaleString()}
                                                    **Gathering**: ${reg_PlayerGathering.toLocaleString()}
                                    
 

                            `, true)
                            .addField("Profiles", `
                                                    [Sigma](https://app.sigmacomputing.com/embed/2Fb3n6osB7MZ0psRKGqR6?name=${reg_PlayerName})
                                                    [MurderLedger](https://murderledger.com/players/${reg_PlayerName}/ledger)
                                                    [AO.com](https://albiononline.com/en/killboard/player/${reg_PlayerId})
                                                    [AO2D](https://www.albiononline2d.com/en/scoreboard/players/${reg_PlayerId})
                            `, true)
                        client.channels.cache.get(channels.alerts).send({ embeds: [embed] })

                        let memberRole = await message.guild.roles.cache.find(role => role.name === roles.registered);

                        message.member.roles.add(memberRole).then(y => {
                           
                                    let tempRole  = message.guild.roles.cache.find(role => role.name === roles.tempAccess);
                                    let guildRole = message.guild.roles.cache.find(role => role.name === reg_PlayerGuildName);
                                    if (!guildRole) {
                                        message.guild.roles.create({

                                            name: reg_PlayerGuildName,


                                        }).catch(console.error)
                                            .then(guildRole => {
                                                console.log(`Created new role with name ${guildRole.name} and color ${guildRole.color}`)
                                                message.member.roles.add(guildRole)

                                            }).catch(console.error)
                                    }
                                    else {
                                        message.member.roles.add(guildRole)
                                    }
                                    message.member.roles.remove(tempRole)
                                    

                        }).catch(console.log("3: " + reg_PlayerAllianceTag));
                    } else {
                        console.log(result[0].affectedRows)
                    }
                } catch (err) {
                    console.log(err)
                }
                found = true;
                break;

            }
        }
        if (!found) {
            newMessage.edit({ content: `We couldn't find your character \`${playerName}\` in Iron Hand.\n\nIf you want to join us -> <#880177021009944607>. `, failIfNotExists: false }).catch(() => console.error('Failed to send - Can\'t send empty messages!'));
        }
    },
};