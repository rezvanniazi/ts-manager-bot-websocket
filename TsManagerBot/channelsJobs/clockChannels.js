const { dynamicDate } = require("../../utils/iranDate")
const { channelEditor } = require("../queryHelper")

function convertToPersianNumber(englishNumber) {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

    return englishNumber
        .toString() // convert to string in case the input is a number
        .replace(/\d/g, (digit) => persianDigits[digit]) // replace each digit with Persian equivalent
}

exports.getClock = (f) => {
    const today = dynamicDate.date

    const minutes = today.getMinutes()
    const hours = today.getHours()
    const HH = hours > 12 ? hours - 12 : hours
    const MM = minutes < 10 ? "0" + minutes : minutes
    const isPm = hours > 12

    if (f == "en") {
        return `${HH}:${MM} ${isPm ? "P.M" : "A.M"}`
    } else {
        return `${convertToPersianNumber(HH)}:${convertToPersianNumber(MM)} ${isPm ? "ب.ظ" : "ق.ظ"}`
    }
}

exports.clockChannelsHandler = (bot) => {
    const clockChannels = bot.channels.clockChannels
    if (!clockChannels) return

    async function updateChannel() {
        clockChannels.forEach(async (ch) => {
            if (ch?.id && ch.format) {
                let _clock = ch.format.toString().replace("%saat", exports.getClock("fa")).replace("%clock", exports.getClock("en"))
                try {
                    await channelEditor(bot, ch.id, { channel_name: _clock })
                } catch {
                    bot.logger.error(`Couldn't update clockChannel ${ch.id}`)
                }
            }
        })
    }

    updateChannel()
    let id = setInterval(updateChannel, 1 * 60 * 1000) // 1 minute

    bot.intervalIds.push(id)
}
