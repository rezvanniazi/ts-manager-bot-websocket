exports.transformTeamSpeakResponse = (body) => {
    // If body is already an array, return it directly
    if (Array.isArray(body)) {
        return body
    }

    // Handle single object case
    const propertyKeys = Object.keys(body).filter((key) => key !== "raw")

    // Check if this is an array-like body (some properties are arrays)
    const isArrayLike = propertyKeys.some((key) => Array.isArray(body[key]))

    if (!isArrayLike) {
        // Single object - wrap in array for consistency
        return [body]
    }

    // Handle array-like body (original transformation logic)
    const firstArrayKey = propertyKeys.find((key) => Array.isArray(body[key]))
    const objectCount = body[firstArrayKey].length
    const result = []

    for (let i = 0; i < objectCount; i++) {
        const obj = {}
        for (const key of propertyKeys) {
            obj[key] = Array.isArray(body[key]) ? body[key][i] : body[key]
        }
        result.push(obj)
    }

    return result
}
exports.getClientList = async (bot, clientType = 0) => {
    let response = await bot.send("clientlist -uid  -times -groups -info -country -voice")
    let clientList = []
    if (response.clid) {
        let clients = this.transformTeamSpeakResponse(response)

        for (let client of clients) {
            client.client_servergroups = client.client_servergroups.split(",") || []
            clientList.push(client)
        }

        clientList = clientList.filter((c) => c.client_type == clientType)
    }

    return clientList || []
}

exports.getBanList = async (bot) => {
    let response = await bot.send("banlist").catch((err) => {
        if (err.id != 1281) {
            console.log(err)
        }
        return []
    })

    let banList = this.transformTeamSpeakResponse(response).filter((r) => r.name != undefined)

    return banList
}

exports.channelEditor = async (bot, channelId, channelProperties) => {
    if (!bot) {
        throw new Error("Bot not found")
    }
    await bot.send("channeledit", { cid: channelId, ...channelProperties }).catch((err) => {
        if (err.id != 1283) {
            throw err
        }
    })
    return
}
