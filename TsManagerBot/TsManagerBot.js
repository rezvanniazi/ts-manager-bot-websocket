const { Raw } = require("teamspeak-query")
const { createLogger } = require("../utils/logger")
const { getClientList } = require("./queryHelper")
const jobsList = require("./jobsList")

class TsManagerBot extends Raw {
    static template = new Map() // templateName -> class instance

    constructor(templateName, conn, channels) {
        if (TsManagerBot.template.has(templateName)) {
            createLogger("managerBot", templateName).error(`Teamplate ${templateName} Already exists`)
            return TsManagerBot.template.get(templateName)
        }
        super({ host: conn.host, port: conn.queryPort })

        this.clientCheckIntervalId = null
        this.intervalIds = []
        this.cronjobIds = []
        this.clientList = new Map() // clid -> clientItslef
        this.logger = createLogger("managerBot", templateName)

        this.templateName = templateName
        this.host = conn.host
        this.serverport = conn.serverPort
        this.queryport = conn.queryPort
        this.queryPassword = conn.queryPassword
        this.username = conn.username
        this.botName = conn.botName
        this.channels = channels
        this.connected = false
        TsManagerBot.template.set(templateName, this)
        this.setMaxListeners(20)
    }

    async createConnection() {
        try {
            await this.connectSocket()
            this.logger.info(`Connected to ${this.host}:${this.queryport}`)
            this.connected = true
            this.sock.setTimeout(5000, () => {
                this._disconnect()
                this.logger.error(`Connection for ${this.templateName} refused`)
                return
            })

            await this.send("login", this.username, this.queryPassword)

            this.logger.info(`Authenticated`)

            await this.send("use", 1)
            ///
            // Set throttle to false to disable query limits
            await this.throttle.set("enable", false)
            // Update nickname
            await this.send("clientupdate", { client_nickname: this.botName })

            // Register for server events
            await this.send("servernotifyregister", { event: "server" }).catch(() =>
                this.logger.error(`couldn't register servernotifyregister:server`)
            )

            await this.send("servernotifyregister", { event: "textchannel" }).catch(() =>
                this.logger.error(`couldn't register servernotifyregister:textchannel`)
            )

            await this.send("servernotifyregister", { event: "textserver" }).catch(() =>
                this.logger.error(`couldn't register servernotifyregister:textserver`)
            )

            await this.send("servernotifyregister", { event: "textprivate" }).catch(() =>
                this.logger.error(`couldn't register servernotifyregister:textprivate`)
            )

            await this.initializeClientChecks()
            this.sock.on("close", () => {
                this._disconnect()
            })
        } catch (err) {
            if (err?.code === "ECONNREFUSED") {
                this.logger.error(`Connection for ${this.templateName} refused`)
                throw new Error("Connection refused")
            } else if (err?.id == 520) {
                this.logger.error(`username or password for ${this.templateName} does not match`)
            } else {
                console.log(err)
                this.logger.error("Something went wrong when connecting")
            }
        }
    }

    async initializeClientChecks() {
        if (this.clientCheckIntervalId) {
            this.logger.info("initialize client checks already running")
            return
        }

        const updateClients = async () => {
            try {
                if (!this.connected) return

                const oldClients = this.getCurrentClients()
                let newClients = await getClientList(this, 0)

                // Manage connected and disconnected
                const disconnectedClients = oldClients.filter((oC) => {
                    const newClient = newClients.find((nC) => nC.clid == oC.clid && nC.client_unique_identifier === oC.client_unique_identifier)

                    // If client no longer exists in new clients, they disconnected
                    if (!newClient) return true

                    // If client exists but connection timestamp changed, they reconnected (so they were temporarily disconnected)
                    return oC.client_lastconnected != newClient.client_lastconnected
                })
                const connectedClients = newClients.filter((nC) => {
                    const existingClient = oldClients.find((oC) => nC.clid == oC.clid && oC.client_unique_identifier === nC.client_unique_identifier)

                    // If no existing client, it's definitely a new connection
                    if (!existingClient) return true

                    // If last_connected timestamp changed, it's a reconnection
                    // Use a small threshold to account for timestamp precision
                    return nC.client_lastconnected != existingClient.client_lastconnected
                })

                // Get hwid for connectedClients with rate limiting
                for (let i = 0; i < connectedClients.length; i++) {
                    const client = connectedClients[i]
                    try {
                        const clientdbinfo = await this.send("clientdbinfo", { cldbid: client.client_database_id })
                        client.hwid = clientdbinfo?.client_hwid || clientdbinfo.hwid || undefined

                        // Add delay to avoid rate limiting (100ms between requests)
                        if (i < connectedClients.length - 1) {
                            await new Promise((resolve) => setTimeout(resolve, 100))
                        }
                    } catch (error) {
                        console.error(`Error getting HWID for client ${client.client_database_id}:`, error)
                    }
                }
                // add hwid to each client
                newClients = newClients.map((c) => {
                    let hwid

                    hwid = oldClients.find((oC) => oC.clid == c.clid)?.hwid || connectedClients.find((cC) => cC.clid == c.clid)?.hwid

                    return { ...c, hwid }
                })

                this.clientList = new Map(newClients.map((c) => [c.clid, c]))

                disconnectedClients.forEach((c) => {
                    console.log("Client disconnected")
                    this.emit("clientDisconnected", c)
                })
                connectedClients.forEach((c) => {
                    this.emit("clientConnected", c)
                })
                /////////Manage connected and disconnected/////////

                // Find servergroup and voiceStatus(client_input_hardware) identify if he is newClient changes
                const oldClientsMap = new Map(oldClients.map((c) => [c.clid, c]))

                for (let client of newClients) {
                    const oldInfo = oldClientsMap.get(client.clid)
                    if (!oldInfo) continue

                    // Compare server groups
                    const oldGroups = oldInfo.client_servergroups || ""
                    const newGroups = client.client_servergroups || ""
                    if (JSON.stringify(oldGroups) !== JSON.stringify(newGroups)) {
                        const addedRanks = newGroups.filter((nG) => !oldGroups.includes(nG))
                        const removedRanks = oldGroups.filter((oG) => !newGroups.includes(oG))
                        this.emit("serverGroupChanged", {
                            client,
                            removedRanks,
                            addedRanks,
                        })
                    }
                    // Compare voice status
                    if (oldInfo.client_input_hardware == 1 && client.client_input_hardware == 0) {
                        this.emit("clientIsInOtherTs", client)
                    }
                }
                return
            } catch (err) {
                console.error(err)
                this.logger.error("Something went wrong when fetching client")
            }
        }
        // Initial update
        await updateClients()

        // initializeBotJobs after initial clients Fetched
        this.initializeBotJobs()

        this.clientCheckIntervalId = setInterval(updateClients, 1000)
    }

    initializeBotJobs() {
        jobsList.forEach((job) => job(this))
    }

    stopClientChecks() {
        if (this.clientCheckIntervalId) {
            clearInterval(this.clientCheckIntervalId)
            this.clientCheckIntervalId = null
        }
    }

    getClient(clid) {
        return this.clientList.get(clid)
    }

    getClientsBySgId(sgId) {
        const clients = this.getCurrentClients()

        return clients.filter((cl) => cl.client_servergroups.includes(sgId.toString()))
    }

    getCurrentClients() {
        return Array.from(this.clientList, ([, client]) => client)
    }

    async _disconnect() {
        try {
            if (!this.connected) return

            this.logger.info("Disconnecting")
            this.connected = false
            this.stopClientChecks()

            const intervals = this.intervalIds
            const cronJobs = this.cronjobIds

            await this?.removeAllListeners()

            for (let i of intervals) {
                clearInterval(i)
            }
            for (let c of cronJobs) {
                await c.stop()
            }

            // Clear client list to free memory
            this.clientList.clear()

            // Clear interval and cronjob arrays
            this.intervalIds.length = 0
            this.cronjobIds.length = 0

            // Clean up dynamic channel manager if it exists
            if (this.dynamicChannelManager) {
                this.dynamicChannelManager.destroy()
                this.dynamicChannelManager = null
            }

            if (this?.jailChannel?.destroy) {
                this.jailChannel.destroy()
            }

            // Remove from static template map to prevent memory leak
            TsManagerBot.template.delete(this.templateName)

            // this?.cleanup()
            try {
                await this?.send("quit")
            } catch {
                // Ignore
            }
        } catch (err) {
            console.log(err)
            return
        }
    }
}

module.exports = TsManagerBot
