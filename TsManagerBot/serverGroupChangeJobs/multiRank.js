const multiRankHandler = (bot) => {
    const multiRank = bot.channels.multiRank
    if (!multiRank) return

    bot.on("serverGroupChanged", ({ client, addedRanks }) => {
        if (addedRanks.includes(multiRank?.rankId?.toString())) {
            multiRank.multiRanks.forEach(async (rId) => {
                await bot.send("servergroupaddclient", { cldbid: client.client_database_id, sgid: rId }).catch(() => {})
            })
        }
    })
}

module.exports = multiRankHandler
