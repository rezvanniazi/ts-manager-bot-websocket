const TsManagerBot = require("./TsManagerBot/TsManagerBot")
const { dynamicDate } = require("./utils/iranDate")
const JobManager = require("./jobs/JobManager")

async function main() {
    await dynamicDate.fetchDateFromApi()
    dynamicDate.startUpdating()
    const jobManager = new JobManager()
    jobManager.startAllJobs()

    const channels = {
        //         clockChannels: [
        //             { id: 2, format: "HELLO: %clock" },
        //             { id: 3, format: "SALAM: %saat" },
        //         ],
        //         dateChannels: [
        //             { id: 6, format: "%YYYY-%MM-%DD-%month-%day" },
        //             { id: 7, format: "%yyyy-%mm-%dd-%mah-%rooz" },
        //         ],
        //         banClientsChannel: {
        //             id: 8,
        //             nameFormat: "Banlist: %c",
        //             descriptionFormat: `%header%
        //                                     [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]

        //                                     [center][SIZE=15]🌟 لیست بن 🌟[/SIZE][/center]

        //                                     [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]
        //                                     %header%

        //                                     %body%
        //                                     .
        //                                     [center][SIZE=12] %n  ⏰%r[/SIZE][/center]
        //                                     %body%

        //                                     %footer%
        //                                     [hr]
        //                                     %footer%`,
        //         },
        //         deathRoomChannel: {
        //             id: 9,
        //             ignoreSgList: [9],
        //             msg: "با ارسال !yes تمام رنک های شما برداشته میشود و با !no میتوانید لغو کنید سی ثانیه فرصت دارید تا جواب بدید",
        //         },
        //         dynamicChannels: [
        //             {
        //                 id: 10,
        //                 minChannels: 3,
        //                 maxChannels: 5,
        //                 maxClients: "1",
        //                 joinPower: 80,
        //                 format: " 🔒┃Pʀɪᴠᴀᴛᴇ Cʜᴀɴɴᴇʟ 「%s」 𝟐/𝟐 Usᴇʀ",
        //                 iconId: 1390113041 | 0,
        //             },
        //             {
        //                 id: 11,
        //                 minChannels: 2,
        //                 maxChannels: 3,
        //                 maxClients: "4",
        //                 joinPower: 80,
        //                 format: " 🔒┃Pʀɪᴠᴀᴛᴇ Cʜᴀɴɴᴇʟ 「%s」 𝟐/𝟐 Usᴇʀ",
        //                 iconId: 1390113041 | 0,
        //             },
        //         ],
        //         newClientsChannel: {
        //             id: 12,
        //             clientDesc: "به سرور تیم اسپیک ندیکس خوش آمدید",
        //             format: "[cspacer]🚸افراد جدید: %c نفر🚸",
        //             descFormat: `%header%
        // [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]

        // [center][SIZE=15]🌟 افراد جدید 🌟[/SIZE][/center]

        // [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]
        // %header%

        // %body%
        // [center][SIZE=12]%i  %name  ⏰%clock[/SIZE][/center]
        // %body%

        // %footer%
        // [hr]
        // %footer%`,
        //         },
        //         onAdminsChannel: { id: 13, format: "تعداد امین ها : %c", adminSgList: [9] },
        //         onClientsChannel: { id: 21, format: "تعداد انلاین ها : %c", ignoreSgList: [9] },
        //         priceChannels: {
        //             usdPrice: {
        //                 id: 22,
        //                 format: "دلار: %p",
        //             },
        //             lirPrice: {
        //                 id: 23,
        //                 format: "لیر: %p",
        //             },
        //             eurPrice: {
        //                 id: 24,
        //                 format: "یورو: %p",
        //             },
        //             btcPrice: {
        //                 id: 25,
        //                 format: "قیمت بیتکوین: %p",
        //             },
        //         },
        //         sgInfoChannels: [
        //             {
        //                 id: 26,
        //                 sgId: 9,
        //                 nameFormat: "[cspacer]⚔️ تعداد: %c | آنلاین: %o ⚔️",
        //                 descriptionFormat: `%header%
        // [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]

        // [center][SIZE=15]🌟 اعضای کلن‬‎ 🌟[/SIZE][/center]

        // [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]
        // %header%

        // %body%
        // [center][SIZE=12]%i  %name  ⏰ [%ON][/SIZE][/center]
        // %body%

        // %footer%
        // [hr]
        // %footer%`,
        //             },
        //         ],
        //         staffList: [
        //             {
        //                 id: 27,
        //                 staffSgList: [{ sgName: "STAFF HA", sgID: 15 }],
        //                 usersFormat: "[%on] : %name 👮🏼",
        //                 descFormat: `%header%
        // [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]

        // [center][SIZE=15]👑 لیست ادمین ها‬‎ 👑[/SIZE][/center]

        // [center][img]https://s6.uupload.ir/files/10_sj4h.gif[/img][/center]
        // %header%
        // %body%
        // [hr]
        // [center][SIZE=20]%sg [/SIZE][/center]
        // [center][SIZE=12] %users% [/SIZE][/center]
        // %body%
        // %footer%
        // [hr][Color=#383838]CopyRight © 2024 Nedxco TeamSpeak | Configured BY -MTX-
        // %footer%`,
        //                 clickable: true,
        //             },
        //         ],
        //         tempChannel: {
        //             listenId: 28,
        //             parentId: 29,
        //             cgId: 13,
        //             pokeFormat: "سلام %client! 🎉 چنل شما ساخته شد. رمز: %password از اقامت لذت ببرید! 😊",
        //             nameFormat: "┣ 🔴 [Auto] %client",
        //             iconId: 1390113041,
        //         },
        //         weathersChannels: {
        //             yazd: {
        //                 id: 31,
        //                 format: "هوای یزد: %t",
        //             },
        //             tehran: {
        //                 id: 32,
        //                 format: "هوای تهران: %t",
        //             },
        //             shiraz: {
        //                 id: 33,
        //                 format: "هوای شیراز: %t",
        //             },
        //             isfahan: {
        //                 id: 34,
        //                 format: "هوای اصفهان: %t",
        //             },
        //             tabriz: {
        //                 id: 35,
        //                 format: "هوای تبریز: %t",
        //             },
        //         },
        //         autoOs: {
        //             linux: 16,
        //         },
        //         serverName: {
        //             format: "Nedx-Server | Public & Game | - %p% - %c/%s",
        //         },
        //         autoCountry: {
        //             countryList: [{ countryName: "UNKNOWN", sgID: 17 }],
        //         },
        //         multiRank: {
        //             rankId: 18,
        //             multiRanks: [19, 20, 21, 22, 23],
        //         },
        //         jailChannels: [
        //             {
        //                 id: 36,
        //                 sgId: 24,
        //                 time: 30,
        //                 format: "رنک جدید شما: زندانی افتخاری! لطفاً با سکوت و انزوا دوست شوید. مدت اقامت شما: %time. 😜",
        //             },
        //         ],
        //         moveRequest: {
        //             canUseList: [],
        //             joinMsg: `کاربر  %sender  درخواست جوین دادن به چنل شما را دارد.
        // در صورت رضایت از کامند accept! استفاده کنید`,
        //             moveMsg: `کاربر  %sender  درخواست موو دادن شما به چنل خود را دارد.
        // در صورت رضایت از کامند accept! استفاده کنید`,
        //         },
        //         autoRank: {
        //             canUseIds: [],
        //             maxMsg: "SALAM",
        //             ranks: [{ rankName: "rez", sgID: 25 }],
        //         },

        forbiddenMsgNotify: {
            sgListToNotify: ["9"],
            pokeFormat: "پیام یافت شد %text",
        },
        voiceStatusChange: {
            sgListToNotify: ["9"],
            pokeFormat: "کاربر %user به ی سرور دگ رفت",
        },
    }

    const conn = {
        host: "localhost",
        queryPort: 4441,
        serverPort: 5955,
        queryPassword: "AyX7RUTTut",
        username: "serveradmin",
        botName: "REZVANTEST",
    }

    const managerbot = new TsManagerBot("rezvan22", conn, channels)
    managerbot.on("textmessage", (ev) => console.log(ev.msg))

    await managerbot.createConnection()

    while (true) {
        managerbot.send("clientinfo", { clid: 1 }).then((res) => {
            console.log(res.client_input_hardware)
        })

        await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    // managerbot.on("serverGroupChanged", (payload) => console.log(payload))
}
process.on("unhandledRejection", (reason, promise) => {
    console.error("=== UNHANDLED PROMISE REJECTION ===")
    console.error("Reason:", reason)

    // If reason is an Error object, it might have a stack
    if (reason instanceof Error) {
        console.error("Error stack:", reason.stack)
    }

    // Try to get the promise creation stack
    if (promise._creationStack) {
        console.error("Promise created at:", promise._creationStack)
    }

    // Additional debugging info
    console.error("Promise details:", promise)
    console.error("================================")

    // Exit in production, continue in development
    if (process.env.NODE_ENV === "production") {
        process.exit(1)
    }
})
main()
