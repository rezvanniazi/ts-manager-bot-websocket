const activeClients = new Map() // client uid -> Join time

const waitTimeForResponse = 30 * 1000 // 30 seconds

exports.deathRoomChannelHandler = async (bot) => {
    const channel = bot.channels.deathRoomChannel
    if (!channel) return

    async function onConnectHandler(clid) {
        // Check if client is in already requested list if not add client
        const client = bot.getClient(clid)
        const now = Date.now()
        const lastCall = activeClients.get(client.client_unique_identifier)

        if (lastCall && now - lastCall < waitTimeForResponse) {
            return
        }

        activeClients.set(client.client_unique_identifier, now)

        const confirmationListener = (ev) => {
            if (ev.invokerid == client.clid) {
                if (ev.msg == "!yes") {
                    const sgToRemove = channel.ignoreSgList
                        ? client.client_servergroups.filter((sg) => !channel.ignoreSgList.includes(parseInt(sg)))
                        : client.client_servergroups
                    for (let sg of sgToRemove) {
                        bot.send("servergroupdelclient", { cldbid: client.client_database_id, sgid: sg }).catch(() => {})
                    }
                } else if (ev.msg == "!no") {
                    bot.send("clientkick", { clid: client.clid, reasonid: 4, reasonmsg: "" }).catch(() => {})
                }
            }
        }
        await bot
            .send("sendtextmessage", {
                target: client.clid,
                targetmode: 1,
                msg: channel.msg.replace("%name", client.client_nickname),
            })
            .catch((err) => console.log(err))
        bot.on("textmessage", confirmationListener)

        setTimeout(async () => {
            bot.off("textmessage", confirmationListener)
            // kick client if already inside this channel
            const client = bot.getClient(clid)
            if (client.cid == channel.id) {
                bot.send("clientkick", { clid: client.clid, reasonid: 4, reasonmsg: channel.kickMsg || "" }).catch(() => {})
            }
        }, waitTimeForResponse)
    }

    bot.on("clientmoved", ({ clid, ctid: movedTo }) => {
        if (movedTo == channel.id) {
            onConnectHandler(clid)
        }
    })
}
