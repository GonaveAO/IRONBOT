const con = require(`../../includes/db.js`);


module.exports = {
    name: 'unregister',
    description: 'Unregister account!',
    async execute(message, args) {
        const [result, fields] = await con.execute(`SELECT * FROM bot_register WHERE discordId = ?`, [message.author.id]);
        if (result.length > 0) {
            const result3 = await con.query(`DELETE FROM bot_register WHERE discordId = ?`, [message.author.id])
            if (result3.length > 0) {
                message.reply(`Account unregistered.`)
                message.member._roles.forEach(rolex => {
                    if (rolex != 647009173405564930 &&
                        rolex != 478853221276844032 &&
                        rolex != 882645323267326003 &&
                        rolex != 677856086589702144 ) {
                        let roleToBeRemoved = message.guild.roles.cache.find(role => role.id === `${rolex}`);
                        console.log(roleToBeRemoved)
                        message.member.roles.remove(roleToBeRemoved)

                    }
                })
            }
        } else {
            message.reply("You are not registered.")
        }


    },
};