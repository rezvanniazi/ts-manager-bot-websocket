const detectNetworkInfo = require("../../utils/detectNetworkinfo")

const forbiddenMsgNotify = async (bot) => {
    try {
        const config = bot.channels.forbiddenMsgNotify
        if (!config) return

        const textMessageHandler = async (ev) => {
            const client = bot.getClient(ev.invokerid)

            if (!client) return

            const msg = ev.msg

            const hasNetworkInfo = detectNetworkInfo(msg)
            let hasForbiddenWord = false

            if (config.forbiddenWords && config.forbiddenWords?.length !== 0) {
                hasForbiddenWord = config.forbiddenWords.find((w) => msg.includes(w))
            }

            if (hasNetworkInfo || hasForbiddenWord) {
                config.sgListToNotify.forEach((sgId) => {
                    const sgClients = bot.getClientsBySgId(sgId)

                    sgClients.forEach((c) => {
                        bot.send("clientpoke", {
                            clid: c.clid,
                            msg: config.pokeFormat.replace("%text", msg).replace("%user", client.client_nickname),
                        })
                    })
                })
            }
        }
        bot.on("textmessage", textMessageHandler)
    } catch {
        bot.logger.error("مشکلی در راه اندازی ممنوع الپیام")
    }
}

module.exports = forbiddenMsgNotify
