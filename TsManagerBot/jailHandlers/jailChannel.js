const { transformTeamSpeakResponse } = require("../queryHelper")

const initializeJailChannel = (bot) => {
    const jailChannels = bot.channels.jailChannels
    if (!jailChannels) return

    new JailChannel(bot)
}

class JailChannel {
    constructor(bot) {
        this.bot = bot
        this.jailConfigs = new Map(bot.channels.jailChannels.map((ch) => [ch.sgId.toString(), ch])) // jail sgid -> config
        this.jailUsers = new Map() // uid -> {hwid, timeoutId, jailSgId}
        this.initializeEventListener()
        this.initializeAbuseCheckJobs()
    }

    initializeEventListener() {
        this.jailConfigs.forEach(async (value, key) => {
            let sgClientList = transformTeamSpeakResponse(await this.bot.send("servergroupclientlist", { sgid: key }).catch(() => []))

            if (sgClientList?.length != 0) {
                sgClientList = sgClientList.forEach(async (c) => await this.bot.send("servergroupdelclient", { cldbid: c.cldbid, sgid: key }))
            }
        })

        this.bot.on("serverGroupChanged", ({ client, addedRanks, removedRanks }) => {
            const addedJail = addedRanks.find((r) => this.jailConfigs.has(r))
            const removedJail = removedRanks.find((r) => this.jailConfigs.has(r))
            if (addedJail) {
                this.addUser(client, this.jailConfigs.get(addedJail))
            }
            if (removedJail) {
                this.removeUser(client, this.jailConfigs.get(removedJail))
            }
        })
    }
    initializeAbuseCheckJobs() {
        this.bot.sock.on("close", () => this.destroy())
        this.bot.intervalIds.push(setInterval(() => this.abuseCheckJobs(), 5 * 1000)) // 5 Seconds
    }

    addUser(client, jailConfig) {
        const bot = this.bot

        bot.send("clientmove", { clid: client.clid, cid: jailConfig.id })
        if (jailConfig.format) {
            bot.send("clientpoke", { clid: client.clid, msg: jailConfig.format.replace("%time", jailConfig.time) })
        }

        if (jailConfig.time !== 0) {
            let t = setTimeout(
                () => bot.send("servergroupdelclient", { sgid: jailConfig.sgId, cldbid: client.client_database_id }).catch(() => {}),
                jailConfig.time * 60 * 1000
            )
            this.jailUsers.set(client.client_unique_identifier, { hwid: client.hwid, timeoutId: t, jailSgId: jailConfig.sgId })
        }
    }

    removeUser(client, jailConfig) {
        const bot = this.bot

        bot.send("servergroupdelclient", {
            sgid: jailConfig.sgId,
            cldbid: client.client_database_id,
        }).catch(() => {})

        bot.send("clientkick", { clid: client.clid, reasonid: 4 }).catch(() => {})
        bot.send("clientpoke", { clid: client.clid, msg: "شما ازاد شدید" }).catch(() => {})
        const jailUser = this.jailUsers.get(client.client_unique_identifier)

        // Remove from jailUsers
        jailUser?.timeoutId ? clearTimeout(jailUser.timeoutId) : null
        this.jailUsers.delete(client.client_unique_identifier)
    }

    // Cleanup method for when bot disconnects
    destroy() {
        // Clear all timeouts
        for (const [uid, jailUser] of this.jailUsers) {
            if (jailUser.timeoutId) {
                clearTimeout(jailUser.timeoutId)
            }
        }
        this.jailUsers.clear()
    }

    abuseCheckJobs() {
        const jailUsers = this.jailUsers

        if (jailUsers.size !== 0) {
            jailUsers.forEach((value) => {
                const currentClients = this.bot.getCurrentClients()
                const jailConfig = this.jailConfigs.get(value.jailSgId.toString())

                const clients = currentClients.filter((c) => c.hwid && c.hwid == value.hwid)

                if (!clients || !jailConfig) return

                clients.forEach((c) => {
                    this.bot.send("clientmove", { clid: c.clid, cid: jailConfig.id })
                })
            })
        }
    }
}

/** 
addUser
removeUser
interval for check jaillist with hwid

*/

module.exports = initializeJailChannel
