const TsManagerBotService = require("./TsManagerBotService")

let TsManagerBotServiceInstance = null

module.exports = (io) => {
    // Create singleton instance of SocketService
    if (!TsManagerBotServiceInstance) {
        TsManagerBotServiceInstance = new TsManagerBotService(io)
    }

    return TsManagerBotServiceInstance
}

// Export getter for accessing the socket service instance
module.exports.getSocketService = () => TsManagerBotServiceInstance
