const { channelEditor } = require("../queryHelper")
const Prices = require("../../models/Prices")

const priceChannelsHandler = (bot) => {
    const priceChannels = bot.channels.priceChannels
    if (!priceChannels) return

    async function updateChannel() {
        try {
            const prices = await Prices.findAll()
            for (let p of prices) {
                const amount = parseInt(p.amount)
                const ch = priceChannels[p.name]
                if (!ch) {
                    continue
                }
                const chName = ch.format.replace("%p", amount.toLocaleString("en-US"))
                await channelEditor(bot, ch.id, { channel_name: chName })
            }
        } catch {
            bot.logger.error("Error price channel editing")
        }
    }
    updateChannel()
    let id = setInterval(updateChannel, 10 * 60 * 1000) // 10 Minutes
    bot.intervalIds.push(id)
}

module.exports = priceChannelsHandler
