const { genRandomString, passwordEncoder } = require("../parseHelper")

const tempChannelHandler = async (bot) => {
    const tempChannel = bot.channels.tempChannel
    if (!tempChannel) return

    async function updateChannel(client) {
        try {
            const clientName = client?.client_nickname
            const channelPassword = genRandomString(5)

            const chName = tempChannel.nameFormat.replace("%client", clientName)
            const pokeTxt = tempChannel.pokeFormat.replace("%client", clientName).replace("%password", channelPassword)
            const serverVersion = (await bot.send("version")).version

            const properties = {
                channel_name: chName,
                channel_delete_delay: 60,
                channel_order: tempChannel.parentId,
            }

            const res = await bot.send("channelcreate", properties).catch(() => {})

            const ch = await bot.send("channelfind", { pattern: chName })

            await bot
                .send("channeledit", {
                    cid: ch.cid,
                    channel_password: serverVersion == "1.5.6" ? passwordEncoder(channelPassword) : channelPassword,
                })
                .catch(() => {})

            if (tempChannel.iconId) {
                await bot
                    .send("channeladdperm", {
                        cid: ch.cid,
                        permsid: "i_icon_id",
                        permvalue: tempChannel.iconId | 0,
                    })
                    .catch((err) => console.log(err))
            }

            await bot.send("clientpoke", { clid: client.clid, msg: pokeTxt }).catch(() => null)

            await bot.send("clientmove", { clid: client.clid, cid: ch.cid }).catch(() => null)
            if (tempChannel.cgId) {
                await bot
                    .send("setclientchannelgroup", {
                        cgid: tempChannel.cgId,
                        cid: chcid,
                        cldbid: client.client_database_id,
                    })
                    .catch((err) => console.log(err))
            }
            return
        } catch (err) {
            console.log(err)
            bot.logger.error("Error tempchannel")
        }
    }

    bot.on("clientmoved", ({ clid, ctid: movedTo }) => {
        if (movedTo == tempChannel.listenId) {
            const client = bot.getClient(clid)
            updateChannel(client)
        }
    })
}

module.exports = tempChannelHandler
