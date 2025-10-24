const { checkSubset } = require("../parseHelper")

const autoCountryHandler = async (bot) => {
    const autoCountry = bot.channels.autoCountry
    if (!autoCountry) return

    const updateChannel = (client) => {
        if (autoCountry.ignoreSgList && autoCountry.ignoreSgList?.length != 0) {
            const isSubset = checkSubset(
                client.client_servergroups,
                autoCountry.ignoreSgList.map((i) => i.toString())
            )
            if (isSubset || client.client_servergroups[0] == "0") {
                return
            }
        }

        if (!autoCountry.countryList) {
            return
        }
        const clientCountry = client.client_country
        const unknown = autoCountry.countryList.find((c) => c.countryName == "UNKNOWN")

        const c = autoCountry.countryList.find((c) => c.countryName == clientCountry)
        if (c || unknown) {
            bot.send("servergroupaddclient", { sgid: c?.sgID || unknown?.sgID, cldbid: client.client_database_id }).catch(() => {})
        }
    }

    bot.on("clientConnected", updateChannel)
}

module.exports = autoCountryHandler
