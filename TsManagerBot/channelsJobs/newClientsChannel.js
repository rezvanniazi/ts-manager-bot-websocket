const TsManagerBots = require("../../models/TsManagerBots")
const { parseDescFormat } = require("../parseHelper")
const { channelEditor } = require("../queryHelper")
const { getClock } = require("./clockChannels")

const newClientsChannelHandler = async (bot) => {
    const ch = bot.channels.newClientsChannel
    if (!ch) return

    async function updateChannel(client) {
        try {
            const managerBot = await TsManagerBots.findOne({ where: { template_name: bot.templateName } })
            if (!managerBot) {
                return
            }
            let newClients = managerBot.sv_new_clients ? JSON.parse(managerBot.sv_new_clients) : []
            const clIsNew = client.client_created == client.client_lastconnected
            const clIsAlreadyAdded = newClients.find((c) => c.uid == client.client_unique_identifier)

            if (clIsNew && !clIsAlreadyAdded) {
                const clData = {
                    name: client.client_nickname,
                    uid: client.client_unique_identifier,
                    enterTime: getClock("en"),
                    enterDate: new Date(),
                }
                newClients.push(clData)
                managerBot.update({
                    sv_new_clients: JSON.stringify(newClients),
                })

                if (ch.clientDesc) {
                    bot.send("clientedit", {
                        clid: client.clid,
                        client_description: ch.clientDesc.replaceAll("%name", client.client_nickname),
                    }).catch(() => {})
                }
            }
            /////////////////////////////////////////////////////////////////////////

            const chName = ch.format.replace("%c", newClients.length)
            let chDescription = ""
            if (ch.descFormat) {
                let desc = parseDescFormat(ch.descFormat)

                newClients.forEach((c, i) => {
                    chDescription += desc.body
                        ? desc.body
                              .replace("%i", i + 1)
                              .replace("%name", c.name)
                              .replace("%clock", c.enterTime) + "\n"
                        : ch.descFormat
                })
                chDescription = [desc.header, chDescription, desc.footer].join("")
            }
            await channelEditor(bot, ch.id, {
                channel_name: chName,
                channel_description: chDescription,
            })
        } catch (err) {
            console.log(err)
            bot.logger.error("Error updating newClientsChannel")
        }
    }

    bot.on("clientConnected", updateChannel)
}

module.exports = newClientsChannelHandler
