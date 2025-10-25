const https = require("https")
const http = require("http")
const { Server } = require("socket.io")
const fs = require("fs")

const config = require("./config")
const { socketAuth } = require("./middleware/auth")
const TsManagerBotController = require("./Server/TsManagerBotController")
const { dynamicDate } = require("./utils/iranDate")
const JobManager = require("./jobs/JobManager")
require("dotenv").config()

class SocketServer {
    constructor() {
        if (process.env.NODE_ENV == "development") {
            this.server = http.createServer()
        } else {
            const certOptions = {
                key: fs.readFileSync("./certs/privkey.pem"),
                cert: fs.readFileSync("./certs/fullchain.pem"),
            }

            this.server = https.createServer(certOptions)
        }

        this.io = new Server(this.server, {
            cors: {
                origin: "*",
            },
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
                skipMiddlewares: true,
            },
        })
        this.io.setMaxListeners(20)
        this.initializeCronJobs()
        this.initializeMiddlewares()
        this.initializeControllers()
        this.initializeErrorHandling()
    }
    async initializeCronJobs() {
        await dynamicDate.fetchDateFromApi()
        dynamicDate.startUpdating()
        const jobManager = new JobManager()
        jobManager.startAllJobs()
    }

    initializeMiddlewares() {
        // JWT Authentication middleware
        this.io.engine.use(socketAuth)

        // Connection ip logging
        this.io.use((socket, next) => {
            console.log(`Socket connection attempt from ${socket.handshake.address}`)
            next()
        })
    }

    initializeControllers() {
        this.tsManagerBotService = TsManagerBotController(this.io)
        global.tsManagerBotService = this.tsManagerBotService
    }

    initializeErrorHandling() {
        this.io.on("connection_error", (err) => {
            console.error("Socket connection error:", err.message)
        })

        process.on("uncaughtException", (err) => {
            console.error("Uncaught Exception:", err)
            this.gracefulShutdown()
        })

        process.on("unhandledRejection", (err) => {
            console.error("Unhandled Rejection:", err)
        })

        // Handle graceful shutdown
        process.on("SIGINT", () => this.gracefulShutdown())
        process.on("SIGTERM", () => this.gracefulShutdown())
    }

    async gracefulShutdown() {
        console.log("Starting graceful shutdown...")

        try {
            // Stop dynamic date updates
            dynamicDate.destroy()

            process.exit(0)
        } catch (error) {
            console.error("Error during graceful shutdown:", error)
            process.exit(1)
        }
    }

    start() {
        this.server.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`)
            console.log(`Socket.IO admin UI available at /socketadmin`)
        })

        return this.server
    }
}

const socketServer = new SocketServer()
module.exports = socketServer.start()
