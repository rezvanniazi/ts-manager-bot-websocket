const Joi = require("joi")
const validate = require("../validation/validate")
const schema = require("../validation/schema")
const TsManagerBot = require("../TsManagerBot/TsManagerBot")
const TsManagerBots = require("../models/TsManagerBots")

const EVENT_NAMES = {
    CREATE: "create-bot",
    DELETE: "delete-bot",
    CONNECT: "connect-bot",
    DISCONNECT: "disconnect-bot",
    RECONNECT: "reconnect-bot",
    GET_BOT_INFO: "get-bot-info",
    GET_BOT_LIST: "get-bot-list",
}

class TsManagerBotService {
    constructor(io) {
        if (!io) {
            console.log("Socket.io is required")
            return
        }
        this.io = io
        this.initializeService()
    }

    initializeService() {
        this.io.on("connection", (socket) => {
            this.createEvent(socket)
            this.connectEvent(socket)
            this.disconnectEvent(socket)
            this.deleteEvent(socket)
            this.reconnectEvent(socket)
            this.getBotInfoEvent(socket)
            this.getBotListEvent(socket)

            socket.on("disconnect", () => {
                this.unsubscribeEvents(socket)
            })
        })
    }

    createEvent(socket) {
        socket.on(EVENT_NAMES.CREATE, async (payload, cb) => {
            try {
                const { templateName, channels, conn } = validate(Joi.object(schema.createBot), payload)

                if (TsManagerBot.template.has(templateName)) {
                    const response = { ok: false, error: "ALREADY_EXISTS" }
                    return cb ? cb(response) : socket.emit(EVENT_NAMES.CREATE + "_error", response)
                }

                const exists = await TsManagerBots.findOne({ where: { template_name: templateName } })
                if (exists) {
                    const response = { ok: false, error: "ALREADY_EXISTS" }
                    return cb ? cb(response) : socket.emit(EVENT_NAMES.CREATE + "_error", response)
                }

                await TsManagerBots.create({ template_name: templateName, channels, conn, created: new Date() })

                new TsManagerBot(templateName, conn, channels)

                const response = { ok: true, data: { templateName } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.CREATE + "_success", response)
            } catch (err) {
                console.log(err)
                const response = { ok: false, error: "INVALID_PAYLOAD" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.CREATE + "_error", response)
            }
        })
    }
    connectEvent(socket) {
        socket.on(EVENT_NAMES.CONNECT, async (payload, cb) => {
            try {
                const { templateName } = validate(Joi.object(schema.connectBot), payload)
                let bot = TsManagerBot.template.get(templateName)
                if (!bot) {
                    const row = await TsManagerBots.findOne({ where: { template_name: templateName } })
                    if (!row) {
                        const response = { ok: false, error: "NOT_FOUND" }
                        return cb ? cb(response) : socket.emit(EVENT_NAMES.CONNECT + "_error", response)
                    }
                    bot = new TsManagerBot(row.template_name, row.conn, row.channels)
                }
                if (bot.connected) {
                    const response = { ok: false, error: "ALREADY_CONNECTED" }
                    return cb ? cb(response) : socket.emit(EVENT_NAMES.CONNECT + "_error", response)
                }

                await bot.createConnection()
                const response = { ok: true, data: { templateName, connected: bot.connected } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.CONNECT + "_success", response)
            } catch {
                const response = { ok: false, error: "CONNECT_FAILED" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.CONNECT + "_error", response)
            }
        })
    }
    disconnectEvent(socket) {
        socket.on(EVENT_NAMES.DISCONNECT, async (payload, cb) => {
            try {
                const { templateName } = validate(Joi.object(schema.disconnectBot), payload)
                const bot = TsManagerBot.template.get(templateName)

                if (!bot) {
                    const response = { ok: false, error: "NOT_FOUND" }
                    return cb ? cb(response) : socket.emit(EVENT_NAMES.DISCONNECT + "_error", response)
                }
                await bot._disconnect()

                const response = { ok: true, data: { templateName, connected: false } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.DISCONNECT + "_success", response)
            } catch {
                const response = { ok: false, error: "DISCONNECT_FAILED" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.DISCONNECT + "_error", response)
            }
        })
    }
    deleteEvent(socket) {
        socket.on(EVENT_NAMES.DELETE, async (payload, cb) => {
            try {
                const { templateName } = validate(Joi.object(schema.deleteBot), payload)
                const bot = TsManagerBot.template.get(templateName)
                if (!bot) {
                    const row = await TsManagerBots.findOne({ where: { template_name: templateName } })
                    if (!row) {
                        const response = { ok: false, error: "NOT_FOUND" }
                        return cb ? cb(response) : socket.emit(EVENT_NAMES.DELETE + "_error", response)
                    }
                    await TsManagerBots.destroy({ where: { template_name: templateName } })
                    const response = { ok: true, data: { templateName } }
                    return cb ? cb(response) : socket.emit(EVENT_NAMES.DELETE + "_success", response)
                }

                await bot._disconnect()

                TsManagerBot.template.delete(templateName)

                await TsManagerBots.destroy({ where: { template_name: templateName } })

                const response = { ok: true, data: { templateName } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.DELETE + "_success", response)
            } catch {
                const response = { ok: false, error: "INVALID_PAYLOAD" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.DELETE + "_error", response)
            }
        })
    }
    reconnectEvent(socket) {
        socket.on(EVENT_NAMES.RECONNECT, async (payload, cb) => {
            try {
                const { templateName } = validate(Joi.object(schema.reconnectBot), payload)
                let bot = TsManagerBot.template.get(templateName)
                if (!bot) {
                    const row = await TsManagerBots.findOne({ where: { template_name: templateName } })
                    if (!row) {
                        const response = { ok: false, error: "NOT_FOUND" }
                        return cb ? cb(response) : socket.emit(EVENT_NAMES.CONNECT + "_error", response)
                    }
                    bot = new TsManagerBot(row.template_name, row.conn, row.channels)
                }

                await bot._disconnect()

                await bot.createConnection()

                const response = { ok: true, data: { templateName, connected: bot.connected === true } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.RECONNECT + "_success", response)
            } catch {
                const response = { ok: false, error: "INVALID_PAYLOAD" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.RECONNECT + "_error", response)
            }
        })
    }
    getBotInfoEvent(socket) {
        socket.on(EVENT_NAMES.GET_BOT_INFO, async (payload, cb) => {
            try {
                const { templateName } = validate(Joi.object(schema.getBotInfo), payload)
                let bot = TsManagerBot.template.get(templateName)
                let info
                if (!bot) {
                    const row = await TsManagerBots.findOne({ where: { template_name: templateName } })
                    if (!row) {
                        const response = { ok: false, error: "NOT_FOUND" }
                        return cb ? cb(response) : socket.emit(EVENT_NAMES.GET_BOT_INFO + "_error", response)
                    }
                    info = {
                        templateName: row.template_name,
                        connected: false,
                        host: row.conn?.host,
                        serverport: row.conn?.serverport,
                        queryport: row.conn?.queryport,
                        botName: row.conn?.botName,
                    }
                } else {
                    info = {
                        templateName: bot.templateName,
                        connected: bot.connected,
                        host: bot.host,
                        serverport: bot.serverport,
                        queryport: bot.queryport,
                        botName: bot.botName,
                    }
                }
                const response = { ok: true, data: { templateName, info } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.GET_BOT_INFO + "_success", response)
            } catch {
                const response = { ok: false, error: "INVALID_PAYLOAD" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.GET_BOT_INFO + "_error", response)
            }
        })
    }
    getBotListEvent(socket) {
        socket.on(EVENT_NAMES.GET_BOT_LIST, async (_, cb) => {
            try {
                const rows = await TsManagerBots.findAll()
                const items = rows.map((row) => {
                    const runtime = TsManagerBot.template.get(row.template_name)
                    return {
                        templateName: row.template_name,
                        connected: runtime ? runtime.connected === true : false,
                        host: (runtime && runtime.host) || row.conn?.host,
                        serverport: (runtime && runtime.serverport) || row.conn?.serverport,
                        queryport: (runtime && runtime.queryport) || row.conn?.queryport,
                        botName: (runtime && runtime.botName) || row.conn?.botName,
                    }
                })

                const response = { ok: true, data: { items } }
                cb ? cb(response) : socket.emit(EVENT_NAMES.GET_BOT_LIST + "_success", response)
            } catch {
                const response = { ok: false, error: "INTERNAL_ERROR" }
                cb ? cb(response) : socket.emit(EVENT_NAMES.GET_BOT_LIST + "_error", response)
            }
        })
    }

    unsubscribeEvents(socket) {
        if (socket) {
            // Remove all event listeners to prevent memory leaks
            socket.removeAllListeners()

            // Also remove any bot-specific listeners if they exist
            if (socket.botListeners) {
                socket.botListeners.forEach(({ bot, event, handler }) => {
                    bot.removeListener(event, handler)
                })
                socket.botListeners.clear()
            }
        }
    }
}

module.exports = TsManagerBotService
