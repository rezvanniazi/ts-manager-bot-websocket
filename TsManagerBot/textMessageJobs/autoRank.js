const { checkSubset } = require("../parseHelper")

const autoRankHelper = {
    add: (bot, client, autoRank, rank) => {
        const mutuals = autoRank.ranks.filter((r) => client.client_servergroups.includes(r.sgID.toString()))
        if (mutuals.length >= 3) {
            if (autoRank.maxMsg) {
                bot.send("sendtextmessage", {
                    target: client.clid,
                    targetmode: 1,
                    msg: autoRank.maxMsg.replace("%name", client.client_nickname),
                }).catch(() => {})
            }
            return
        }
        const selectedSg = autoRank.ranks.find((r) => r.rankName == rank)
        if (selectedSg) {
            bot.send("servergroupaddclient", { cldbid: client.client_database_id, sgid: selectedSg.sgID }).catch(() => {})
        }
    },
    remove: (bot, client, autoRank, rank) => {
        const selectedSg = autoRank.ranks.find((r) => r.rankName == rank)
        if (selectedSg) {
            bot.send("servergroupdelclient", { sgid: selectedSg.sgID, cldbid: client.client_database_id }).catch(() => {})
        }
    },
    list: (bot, client, autoRank) => {
        bot.send("sendtextmessage", {
            target: client.clid,
            targetmode: 1,
            msg: autoRank.msgFormat?.replace("%name", client.client_nickname) || "رنکی برای نمایش وجود ندارد",
        }).catch(() => {})
    },
}

function autoRankHandler(bot) {
    const autoRank = bot.channels.autoRank
    if (!autoRank) return

    bot.on("textmessage", async (ev) => {
        if (ev.msg.includes("!rank")) {
            const invoker = bot.getClient(ev.invokerid)
            if (!invoker) return

            if (!autoRank.canUseIds || autoRank.canUseIds.length == 0 || checkSubset(invoker.client_servergroups, autoRank.canUseIds)) {
                let msg = ev.msg.split(" ")
                if (msg[1] == "add") {
                    autoRankHelper.add(bot, invoker, autoRank, msg[2])
                } else if (msg[1] == "remove") {
                    autoRankHelper.remove(bot, invoker, autoRank, msg[2])
                } else if (msg[1] == "list") {
                    autoRankHelper.list(bot, invoker, autoRank)
                }
            }
        }
    })
}

module.exports = autoRankHandler
