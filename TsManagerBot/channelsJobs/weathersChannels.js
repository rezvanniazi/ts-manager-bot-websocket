const Weathers = require("../../models/Weathers")
const { channelEditor } = require("../queryHelper")

const weathersChannelsHandler = async (bot) => {
    const weathersChannels = bot.channels.weathersChannels
    if (!weathersChannels) return

    async function updateChannel() {
        const weathers = await Weathers.findAll({ raw: true })

        for (let key in weathersChannels) {
            const ch = weathersChannels[key]
            const w = weathers.find((w) => w.city == key)

            if (!w) continue

            const chName = ch.format.replace("%t", w.d)

            await channelEditor(bot, ch.id, { channel_name: chName })
        }
    }
    updateChannel()

    let id = setInterval(updateChannel, 10 * 60 * 1000) // 10 Minutes
    bot.intervalIds.push(id)
}

module.exports = weathersChannelsHandler
