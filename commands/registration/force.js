const con = require(`../../includes/db.js`);
const Discord = require('discord.js');
const index = require("../../app.js");
const client = index.Gclient;
const API = require(`../../includes/api.js`);

async function unregisterPlayer(type, player, message) {
    let sqlQ = "";
    let sqlD = "";
    if (type == "discord") {
        if (isNaN(player)) {
            let tplayer = await API.getUserFromMention(player)
            player = tplayer.id
        }
        sqlQ = `SELECT * FROM bot_register WHERE discordId = ?`
        sqlD = `DELETE FROM bot_register WHERE discordId = ?`
    } else if (type == "player") {
        sqlQ = `SELECT * FROM bot_register WHERE playerName = ?`
        sqlD = `DELETE FROM bot_register WHERE playerName = ?`
    } else {
        return;
    }
    const [result, fields] = await con.execute(sqlQ, [player]);
    if (result.length > 0) {
        let discordId = result[0].discordId
        let playerName = result[0].playerName
        const discordMember = await message.guild.members.cache.get(discordId);
        if (discordMember) {
            if (!discordMember.roles.cache.find(x => x.name === "Iron Council")){
                const result3 = await con.query(sqlD, [player])
                if (result3.length > 0) {
                    discordMember.roles.set([]);
                    message.reply(`<@${discordId}> that registered under ${playerName} has been unregistered!`);
                }
            } else {
                message.reply("You are not authorized to remove this member.")
            }
        } else {
            const result3 = await con.query(sqlD, [player])
            if (result3.length > 0) {
                message.reply(`<@${discordId}> is not on this discord anymore, but ${playerName} has been deregistered.`)
            }

        }


    } else {
        message.reply("Player/User not found.")
    }
}

module.exports = {
    name: 'funreg',
    description: 'Force unregister account!',
    async execute(message, args) {
        if (!message.member.roles.cache.find(x => x.name === "Iron Council")) {
            return;
        }
        if (typeof args[0] === 'undefined') {
            return;
        }
        if (typeof args[1] === 'undefined') {
            return;
        }

        let type = args[0];
        let player = args[1];
        switch (type) {
            case "discord":
                unregisterPlayer(type, player, message);
                break;
            case "player":
                unregisterPlayer(type, player, message);
                break;
            default:
            // code block
        }


    },
};