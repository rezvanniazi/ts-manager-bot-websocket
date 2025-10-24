const { checkSubset } = require("../parseHelper")

const findLowerRange = (number, timeList) => {
    const ranges = timeList.map((t) => t.time)
    if (number < ranges[0]) return timeList[0]
    if (number > ranges[ranges.length - 1]) return timeList[timeList.length - 1]

    return timeList.find((t, i) => number >= ranges[i] && number < ranges[i + 1])
}

exports.idleResetHandler = (bot, client, idleTime) => {
    if (idleTime.ignoreSgList != []) {
        const isSubset = checkSubset(client.propcache.client_servergroups, idleTime.ignoreSgList)
        if (isSubset) return
    }

    const timeList = idleTime.timeList.sort((a, b) => a.time - b.time)

    bot.clientAddPerm(client, {
        permname: "i_icon_id",
        permvalue: timeList[0].iconID | 0,
        skip: false,
        negate: false,
    }).catch(() => {})
}

exports.idleUpdateHandler = (bot) => {
    const idleTime = bot.channels.idleTime
    if (!idleTime) return

    const update = async () => {
        let clients = bot.getCurrentClients()
        if (idleTime.ignoreSgList) {
            clients = clients.filter((c) => {
                const isSubset = checkSubset(c.client_servergroups, idleTime.ignoreSgList)
                return !isSubset
            })
        }

        const timeList = idleTime.timeList.sort((a, b) => a.time - b.time)
        for (var client of clients) {
            const time = findLowerRange(client.client_idle_time / 60000, timeList)
            if (time) {
                bot.send("clientaddperm", {
                    cldbid: client.client_database_id,
                    permsid: "i_icon_id",
                    permvalue: time.iconID | 0,
                    skip: false,
                    negate: false,
                }).catch(() => {})
            }
        }
    }

    try {
        update()
        let id = setInterval(update, 1 * 30 * 1000)
        bot.intervalIds.push(id)
    } catch {
        console.log(`idleTime Interval Couldn't create on ${bot.templateName}`)
    }
}
