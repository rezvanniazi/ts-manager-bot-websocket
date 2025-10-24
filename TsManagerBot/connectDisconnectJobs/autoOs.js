const { checkSubset } = require("../parseHelper")

const autoOsHandler = async (bot) => {
    const autoOs = bot.channels.autoOs
    if (!autoOs) return

    const updateChannel = (client) => {
        try {
            if (autoOs.ignoreSgList && autoOs.ignoreSgList?.length != 0) {
                const isSubset = checkSubset(
                    client.client_servergroups,
                    autoOs.ignoreSgList.map((i) => i.toString())
                )
                if (isSubset || client.client_servergroups[0] == "0") {
                    return
                }
            }

            const clientPlatform = client.client_platform
            const clientVersion = client.client_version

            const platformToSgId = {
                Linux: autoOs.linux,
                macOs: autoOs.mac,
                Android: autoOs.android,
                iOS: autoOs.iOS,
                Windows: clientVersion.includes("3.0.19") ? autoOs.android : autoOs.windows,
            }

            const sgId = platformToSgId[clientPlatform]
            if (!sgId) return

            bot.send("servergroupaddclient", { cldbid: client.client_database_id, sgid: sgId }).catch(() => {})

            return
        } catch {
            bot.logger.error("autoOs error for client: ", client.client_nickname)
        }
    }

    bot.on("clientConnected", updateChannel)
}

module.exports = autoOsHandler
