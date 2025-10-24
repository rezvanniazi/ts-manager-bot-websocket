const voiceStatusChangeJob = async (bot) => {
    const config = bot.channels.voiceStatusChange
    if (!config) return

    const clientIsInOthersTsHandler = (client) => {
        if (config.ignoreSgList && client?.ignoreSgList?.length !== 0) {
            const isIgnore = client.client_servergroups.filter((cSgId) => config.ignoreSgList.includes(cSgId.toString()))

            if (isIgnore[0]) {
                return
            }
        }
        const pokeText = config.pokeFormat.replace("%user", client.client_nickname)

        config?.sgListToNotify.forEach((sgId) => {
            const sgClients = bot.getClientsBySgId(sgId)

            sgClients.forEach((sgClient) => {
                if (sgClient.clid == client.clid) return

                bot.send("clientpoke", { clid: sgClient.clid, msg: pokeText })
            })
        })
    }

    bot.on("clientIsInOtherTs", clientIsInOthersTsHandler)
}

module.exports = voiceStatusChangeJob
