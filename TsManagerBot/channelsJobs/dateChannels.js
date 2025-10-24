const { channelEditor } = require("../queryHelper")
const cron = require("node-cron")
const moment = require("jalali-moment")
const { dynamicDate } = require("../../utils/iranDate")

exports.dateChannelsHandler = (bot) => {
    const dateChannels = bot.channels.dateChannels
    if (!dateChannels) return

    async function updateChannel() {
        const today = dynamicDate.date
        const jm = moment(today).locale("fa")
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        const DD = today.getDate()
        const MM = today.getMonth() + 1
        const YYYY = today.getFullYear()
        const YY = YYYY.toString().slice(2, 4)
        const month = monthNames[MM]
        const day = dayNames[today.getDay()]
        const yyyy = jm.format("yyyy")
        const yy = yyyy.slice(2, 4)
        const mm = jm.format("MM")
        const dd = jm.format("DD")
        const mah = jm.format("MMMM")
        const rooz = jm.format("dddd")

        dateChannels.forEach(async (ch) => {
            if (ch.id && ch.format) {
                let date = ch.format
                    .replace("%YYYY", YYYY)
                    .replace("%MM", MM < 10 ? "0" + MM : MM)
                    .replace("%DD", DD < 10 ? "0" + DD : DD)
                    .replace("%YY", YY)
                    .replace("%month", month)
                    .replace("%day", day)
                    .replace("%yyyy", yyyy)
                    .replace("%yy", yy)
                    .replace("%mm", mm)
                    .replace("%dd", dd)
                    .replace("%mah", mah)
                    .replace("%rooz", rooz)
                try {
                    await channelEditor(bot, ch.id, { channel_name: date })
                } catch {
                    bot.logger.error(`Error editing dateChannel ${ch.id}`)
                }
            }
        })
    }
    updateChannel()

    let c = cron.schedule("0 * * * *", updateChannel) // Every hour
    c.start()
    bot.cronjobIds.push(c)
}
