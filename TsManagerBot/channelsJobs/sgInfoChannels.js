const { parseDescFormat } = require("../parseHelper")
const { channelEditor, transformTeamSpeakResponse } = require("../queryHelper")

const sgInfoChannelsHandler = async (bot) => {
    const sgInfoChannels = bot.channels.sgInfoChannels
    if (!sgInfoChannels) return

    const updateChannel = async () => {
        for (let i in sgInfoChannels) {
            const channel = sgInfoChannels[i]
            let sgClientList = transformTeamSpeakResponse(await bot.send("servergroupclientlist", { sgid: channel.sgId }).catch(() => []))
            const onlineList = bot.getCurrentClients()
            let count = 0

            sgClientList = sgClientList.map((c) => {
                const isOnline = onlineList.find((o) => o?.client_database_id == c.cldbid)
                isOnline ? count++ : null
                c.online = isOnline ? true : false
                return c
            })

            const chName = channel.nameFormat
                .replace("%c", sgClientList.length)
                .replace("%on", count != 0 ? "انلاین" : "آفلاین")
                .replace("%ON", count != 0 ? "Online" : "Offline")
                .replace("%o", count)

            let chDescription = ""
            if (channel.descriptionFormat) {
                let desc = parseDescFormat(channel.descriptionFormat)

                sgClientList.forEach(async (c, index) => {
                    chDescription += desc.body
                        ? desc.body
                              .replace("%name", c.client_nickname)
                              .replace("%i", index + 1)
                              .replace("%on", c.online ? "[B][COLOR=GREEN]انلاین[/COLOR][/B]" : "[B][COLOR=RED]آفلاین[/COLOR][/B]")
                              .replace("%ON", c.online ? "[B][COLOR=GREEN]Online[/COLOR][/B]" : "[B][COLOR=RED]Offline[/COLOR][/B]") + "\n"
                        : channel.descriptionFormat
                })
                chDescription = [desc?.header, chDescription, desc.footer].join("")
            }

            await channelEditor(bot, channel.id, { channel_name: chName, channel_description: chDescription })
        }
    }

    bot.on("clientConnected", updateChannel)
    bot.on("clientDisconnect", updateChannel)
    bot.on("serverGroupChanged", updateChannel)
}

module.exports = sgInfoChannelsHandler
