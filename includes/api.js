
const axios = require('axios');
const Discord = require('discord.js');
const index = require("../app.js");
const client = index.Gclient;
const con = require(`./db.js`);
const { allowedGuilds } = require("./config.json")



module.exports = {
    name: 'api',
    description: 'ALBION API',
    async searchPlayer(playerName) {
        console.log(playerName)
        try {
            const response = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/search?q=${playerName}`);
            //console.log(response.data);
            return response.data;

        } catch (error) {
            console.error(error);
        }
    },
    async getUserData(playerId) {
        //console.log(playerId)
        try {
            const response = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/players/${playerId}`);
            //console.log(response.data);
            return response.data;

        } catch (error) {
            console.error(error);
        }
    },
    async getGuildInfo(guildId) {
        //console.log(guildId)
        try {
            const response = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId}`);
            //console.log(response.data);
            return response.data;

        } catch (error) {
            console.error(error);
        }
    },
    async getAlliance(allianceId) {
        var t = 1;//Date.now();
        console.log(allianceId)
        try {
            const response = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/alliances/${allianceId}`);
            //console.log(response.data);
            return response.data;

        } catch (error) {
            console.error(error);
        }
    },
    async getGuildMembers(guildId) {
        var t = 1;//Date.now();
        console.log(guildId)
        const [result, fields] = await con.execute(`SELECT * FROM config_guilds WHERE guildId = ?`, [guildId]);
        if (result.length > 0) {

            const members = result[0].members;
            //console.log(members)
            return members;
        } else {
            console.log("!!!!!!!!!!!!!!!!!!!!!no members found  " + guildId)
            return "error";
        }
        // try {

        //     //const response = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId}/members`);
        //     //console.log(response.data);
        //     //return response.data;

        // } catch (error) {
        //     console.error(error);
        // }
    },
    async isPlayerFromAlliance(allianceId) {
        console.log(alliances)
        console.log("checking: " + allianceId)
        if (alliances.includes(allianceId)) {
            return true;
        } else {
            return false;
        }
    },
    async getUserFromMention(mention) {
        if (!mention) return;

        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);

            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }
            console.log(mention)
            return client.users.cache.get(mention);
        }
    },
    async checkBlacklist(playerName) {

        const [result, fields] = await con.execute(`SELECT * FROM bot_blacklist WHERE playerName = ?`, [playerName]);
        if (result.length > 0) {
            var dateBl = result[0].date;
            var dateString =

                ("0" + dateBl.getUTCDate()).slice(-2) + "/" +
                ("0" + (dateBl.getUTCMonth() + 1)).slice(-2) + "/" +
                dateBl.getUTCFullYear() + " " +
                ("0" + dateBl.getUTCHours()).slice(-2) + ":" +
                ("0" + dateBl.getUTCMinutes()).slice(-2) + ":" +
                ("0" + dateBl.getUTCSeconds()).slice(-2);

            if (dateString == "05/11/2020 11:49:18") {
                dateString = "n/a";
            }

            return {
                "isBl": true,
                "playerName": result[0].playerName,
                "author": result[0].author,
                "date": dateString,
                "reason": result[0].reason
            }
        } else {
            return {
                "isBl": false
            }
        }
    },
    async isGuildOutlaw(id) {


        const [result, fields] = await con.execute(`SELECT * FROM config_guilds WHERE guildId = ?`, [id]);
        if (result.length > 0) {
            var outlaw = result[0].outlaw;
            if (outlaw > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    async isPlayerFromGuild(guildId) {
        for (var i = 0; i < allowedGuilds.length; i++) {
            if (guildId == allowedGuilds[i].id) {
                return true;
            }
        }
        return false;
        
    },
};

