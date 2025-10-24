const serverName = async (bot) => {
    const serverName = bot.channels.serverName
    if (!serverName) return

    const clientsCount = bot.getCurrentClients().length
    const serverSlots = (await bot.send("serverinfo")).virtualserver_maxclients
    const onlinesPercent = Math.round((clientsCount * 100) / serverSlots)
    let virtualserverName

    if (serverName.format) {
        virtualserverName = serverName.format.replace("%p", onlinesPercent).replace("%c", clientsCount).replace("%s", serverSlots)
    }

    await bot.send("serveredit", { virtualserver_name: virtualserverName })
}

module.exports = serverName
