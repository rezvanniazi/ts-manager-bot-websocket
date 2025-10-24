const { parseDescFormat } = require("../parseHelper")
const { channelEditor, transformTeamSpeakResponse } = require("../queryHelper")

const staffListChannelHandler = (bot) => {
    const channels = bot.channels.staffList
    if (!channels || channels.length == 0) return

    const updateChannels = async () => {
        try {
            for (let i in channels) {
                const ch = channels[i]
                let chDescription
                let descriptionBody = ""
                let desc = parseDescFormat(ch.descFormat)
                if (!desc.body) {
                    continue
                }
                for (let j in ch.staffSgList) {
                    const { sgName, sgID } = ch.staffSgList[j]
                    let sgClientList = transformTeamSpeakResponse(await bot.send("servergroupclientlist", { sgid: sgID }).catch(() => []))
                    const onlineList = bot.getCurrentClients()
                    sgClientList = sgClientList.map((c) => {
                        c.online = onlineList.find((o) => o.client_database_id == c.cldbid) ? true : false
                        return c
                    })
                    let usersFormat = ""
                    sgClientList.forEach((c, index) => {
                        usersFormat +=
                            ch.usersFormat
                                .replace(
                                    "%name",
                                    ch.clickable ? `[URL=client://1/${c.client_unique_identifier}]${c.client_nickname}[/URL]` : c.client_nickname
                                )
                                .replace("%i", index + 1)
                                .replace("%on", c.online ? "[B][COLOR=GREEN]انلاین[/COLOR][/B]" : "[B][COLOR=RED]آفلاین[/COLOR][/B]")
                                .replace("%ON", c.online ? "[B][COLOR=GREEN]Online[/COLOR][/B]" : "[B][COLOR=RED]Offline[/COLOR][/B]") + "\n"
                    })

                    descriptionBody += desc.body.replace("%users%", usersFormat).replace("%sg", sgName)
                }

                chDescription = [desc?.header, descriptionBody, desc.footer].join("\n")

                channelEditor(bot, ch.id, { channel_description: chDescription })
            }
        } catch {
            bot.logger.error("Error staffListChannels")
        }
    }
    updateChannels()

    bot.on("clientConnected", updateChannels)
    bot.on("clientDisconnected", updateChannels)
    bot.on("serverGroupChanged", updateChannels)
}

module.exports = staffListChannelHandler
