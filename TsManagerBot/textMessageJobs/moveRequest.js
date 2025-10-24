const { checkSubset } = require("../parseHelper")

const activeRequests = new Map()
const activeAccepts = new Map()

const moveRequestHelper = {
    move: async (bot, sender, receiver, moveMsg) => {
        const now = Date.now()

        // Find receiver using teamspeak-query .send()
        const receiverResponse = await bot.send("clientfind", { pattern: receiver })
        const receiverClient = bot.getClient(receiverResponse.clid) // Assuming transformTeamSpeakResponse is used

        if (!receiverClient) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: sender.clid,
                msg: "کاربر مورد نظر شما یافت نشد",
            })
            return
        }

        let request = activeRequests.get(sender.client_unique_identifier)

        if (request?.lastCall && now - request.lastCall < 30 * 1000) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: sender.clid,
                msg: `شما درخواست باز دارید لطفا ${Math.floor(30 - Math.abs((request.lastCall - now) / 1000))} ثانیه دیگر صبر کنید`,
            })
            return
        }

        let accepter = activeAccepts.get(receiverClient.client_unique_identifier)
        if (accepter?.lastCall && now - accepter.lastCall < 30 * 1000) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: sender.clid,
                msg: `کاربر مورد نظر یک درخواست باز دارد لطفا ${Math.floor(30 - Math.abs((request.lastCall - now) / 1000))} ثانیه صبر کنید`,
            })
            return
        }

        activeRequests.set(sender.client_unique_identifier, { lastCall: now, type: "move" })
        activeAccepts.set(receiverClient.client_unique_identifier, {
            lastCall: now,
            type: "move",
            sender: sender,
        })

        await bot.send("sendtextmessage", {
            targetmode: 1,
            target: receiverClient.clid,
            msg: moveMsg.replace("%receiver", receiverClient.client_nickname).replace("%sender", sender.client_nickname),
        })

        setTimeout(() => {
            activeRequests.delete(sender.client_unique_identifier)
            activeAccepts.delete(receiverClient.client_unique_identifier)
        }, 30 * 1000)
    },

    join: async (bot, sender, receiver, joinMsg) => {
        const now = Date.now()

        // Find receiver using teamspeak-query .send()
        const receiverResponse = await bot.send("clientfind", { pattern: receiver })
        const receiverClient = bot.getClient(receiverResponse.clid) // Assuming transformTeamSpeakResponse is used

        if (!receiverClient) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: sender.clid,
                msg: "کاربر مورد نظر شما یافت نشد",
            })
            return
        }

        let request = activeRequests.get(sender.client_unique_identifier)

        if (request?.lastCall && now - request.lastCall < 30 * 1000) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: sender.clid,
                msg: `شما درخواست باز دارید لطفا ${Math.floor(30 - Math.abs((request.lastCall - now) / 1000))} ثانیه دیگر صبر کنید`,
            })
            return
        }

        let accepter = activeAccepts.get(receiverClient.client_unique_identifier)
        if (accepter?.lastCall && now - accepter.lastCall < 30 * 1000) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: sender.clid,
                msg: `کاربر مورد نظر یک درخواست باز دارد لطفا ${Math.floor(30 - Math.abs((request.lastCall - now) / 1000))} ثانیه صبر کنید`,
            })
            return
        }

        activeRequests.set(sender.client_unique_identifier, { lastCall: now, type: "join" })
        activeAccepts.set(receiverClient.client_unique_identifier, {
            lastCall: now,
            type: "join",
            sender: sender,
        })

        await bot.send("sendtextmessage", {
            targetmode: 1,
            target: receiverClient.clid,
            msg: joinMsg.replace("%receiver", receiverClient.client_nickname).replace("%sender", sender.client_nickname),
        })

        setTimeout(() => {
            activeRequests.delete(sender.client_unique_identifier)
            activeAccepts.delete(receiverClient.client_unique_identifier)
        }, 30 * 1000)
    },

    accept: async (bot, accepter) => {
        let request = activeAccepts.get(accepter.client_unique_identifier)
        if (!request) {
            await bot.send("sendtextmessage", {
                targetmode: 1,
                target: accepter.clid,
                msg: "شما درخواستی برای قبول کردن ندارید",
            })
            return
        }

        try {
            if (request.type == "move") {
                await bot.send("clientmove", {
                    clid: accepter.clid,
                    cid: request.sender.cid,
                })
            } else if (request.type == "join") {
                await bot.send("clientmove", {
                    clid: request.sender.clid,
                    cid: accepter.cid,
                })
            }

            // Clean up after successful accept
            activeRequests.delete(request.sender.client_unique_identifier)
            activeAccepts.delete(accepter.client_unique_identifier)
        } catch (err) {
            console.error("Error moving client:", err)
        }
    },
}

function moveRequestHandler(bot) {
    const moveRequest = bot.channels.moveRequest
    if (!moveRequest) return

    bot.on("textmessage", async (ev) => {
        if (ev.msg.includes("!move") || ev.msg.includes("!join")) {
            const invoker = bot.getClient(ev.invokerid)

            let msg = ev.msg.split(" ")
            console.log(msg)
            if (moveRequest?.canUseList?.length == 0 || checkSubset(invoker.client_servergroups, moveRequest.canUseList)) {
                console.log("HH")
                if (msg[0] == "!join") {
                    moveRequestHelper.join(bot, invoker, msg[1], moveRequest.joinMsg)
                } else if (msg[0] == "!move") {
                    moveRequestHelper.move(bot, invoker, msg[1], moveRequest.moveMsg)
                }
            }
        }
        if (ev.msg.includes("!accept")) {
            const invoker = bot.getClient(ev.invokerid)

            moveRequestHelper.accept(bot, invoker)
        }
    })
}

module.exports = moveRequestHandler
