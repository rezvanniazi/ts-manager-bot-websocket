const { getOnlineClients } = require("../parseHelper")
const { channelEditor } = require("../queryHelper")

exports.onClientsChannelHandler = async (bot) => {
    const onClientsChannel = bot.channels.onClientsChannel
    if (!onClientsChannel) return

    async function updateChannel() {
        try {
            const { clientCount } = await getOnlineClients(bot, onClientsChannel.ignoreSgList)

            const clientsChannelName = onClientsChannel.format.replace("%c", clientCount)

            await channelEditor(bot, onClientsChannel.id, { channel_name: clientsChannelName })
        } catch {
            bot.logger.error("Error updating onClientsChannels")
        }
    }

    bot.on("clientConnected", updateChannel)
    bot.on("clientDisconnected", updateChannel)
    bot.on("serverGroupChanged", updateChannel)
}
