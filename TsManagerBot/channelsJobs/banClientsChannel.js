const { getBanList, channelEditor } = require("../queryHelper")
const { parseDescFormat } = require("../parseHelper")

const banClientsChannel = async (bot) => {
    const ch = bot.channels.banClientsChannel
    if (!ch) return

    async function updateChannel() {
        const banList = await getBanList(bot)

        const banCount = banList.length
        const chName = ch.nameFormat.replace("%c", banCount)
        let chDescription = ""

        if (ch.descriptionFormat) {
            let desc = parseDescFormat(ch.descriptionFormat)

            banList.forEach((i) => {
                chDescription += desc.body ? desc.body.replace("%n", i.lastnickname).replace("%r", i.reason) + "\n" : ch.descriptionFormat
            })
            chDescription = [desc?.header, chDescription, desc?.footer].join("")
        }
        try {
            await channelEditor(bot, ch.id, { channel_name: chName, channel_description: chDescription })
        } catch (err) {
            console.log(err)
            bot.logger.error("Couldn't edit ban clients channel")
        }
    }
    updateChannel()
    let id = setInterval(updateChannel, 5 * 60 * 1000) // 5 Minutes
    bot.intervalIds.push(id)
}

module.exports = banClientsChannel
