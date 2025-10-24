const { getOnlineAdmins } = require("../parseHelper")
const { channelEditor } = require("../queryHelper")

exports.onAdminsChannelHandler = async (bot) => {
    const onAdminsChannel = bot.channels.onAdminsChannel
    if (!onAdminsChannel) return

    async function updateChannel() {
        try {
            const { adminCount } = getOnlineAdmins(bot, onAdminsChannel.adminSgList)

            const adminsChannelName = onAdminsChannel.format.replace("%c", adminCount)

            await channelEditor(bot, onAdminsChannel.id, { channel_name: adminsChannelName })
        } catch {
            bot.logger.error("Error updating onAdminsChannel")
        }
    }
    updateChannel()

    bot.on("clientConnected", updateChannel)
    bot.on("clientDisconnected", updateChannel)
    bot.on("serverGroupChanged", updateChannel)
}
