const crypto = require("crypto")

let checkSubset = (parentArray, subsetArray) => {
    let d = []
    subsetArray.map((el) => {
        d.push(parentArray.includes(el.toString()))
    })
    return d.includes(true) ? true : false
}

function getOnlineClients(bot, ignoreSgList) {
    try {
        let clientCount = 0
        const clientList = bot.getCurrentClients()

        for (let i in clientList) {
            const client = clientList[i]

            if (ignoreSgList != [] && !checkSubset(client?.client_servergroups, ignoreSgList)) {
                clientCount++
            }
        }

        return { clientCount }
    } catch (err) {
        console.log(err)
        return 0
    }
}

function getOnlineAdmins(bot, adminSgList) {
    try {
        let adminCount = 0
        const clientList = bot.getCurrentClients()
        console.log(clientList.length)
        for (let client of clientList) {
            if (adminSgList.length !== 0 && client.client_servergroups.some((item) => adminSgList.includes(item.toString()))) {
                adminCount++
            }
        }

        return { adminCount }
    } catch (err) {
        console.log(err)
        return 0
    }
}

const genRandomString = (length) => {
    const characters = "0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters[randomIndex]
    }
    return result
}

const passwordEncoder = (p) => {
    // Example input (channel password)

    // Step 1: Hash the password using SHA-1
    const sha1Hash = crypto.createHash("sha1").update(p).digest() // Raw buffer

    // Step 2: Decode the hash (if Base64 encoded)
    // Assuming the SHA-1 hash is Base64 encoded in the original context,
    // encode it to Base64 first for demonstration:
    const base64Encoded = sha1Hash.toString("base64")

    // Decode the Base64 (reverse operation)
    return base64Encoded
}

const parseDescFormat = (text) => {
    const sections = {}
    const regex = /%(header|body|footer)%([\s\S]*?)%\1%/g
    let match

    while ((match = regex.exec(text)) !== null) {
        sections[match[1]] = match[2].trim() // Trim to remove extra spaces or newlines
    }

    return sections
}

module.exports = {
    getOnlineClients,
    getOnlineAdmins,
    genRandomString,
    passwordEncoder,
    parseDescFormat,
    checkSubset,
}
