const Joi = require("joi")

const emptyChecker = (value) => {
    const hasEmptyValue = Object.values(value).some((v) => v === "" || v === null || v === undefined)
    if (hasEmptyValue) {
        // Remove the object by returning undefined
        return undefined
    }
    return value // Keep the object if all values are valid
}

exports.channelsSchema = Joi.object({
    clockChannels: Joi.array()
        .sparse()
        .items(
            Joi.object({
                id: Joi.number().integer().allow("").optional(),
                format: Joi.string().allow("").optional(),
            }).custom(emptyChecker)
        )
        .custom((value) => {
            let newValue = value.filter((item) => item !== undefined)
            return newValue.length == 0 ? undefined : newValue
        }),
    dateChannels: Joi.array()
        .sparse()
        .items(
            Joi.object({
                id: Joi.number().integer().empty("").default(null).optional(),
                format: Joi.string().empty("").default(null).optional(),
            }).custom(emptyChecker)
        )
        .custom((value) => {
            let newValue = value.filter((item) => item !== undefined)
            return newValue.length == 0 ? undefined : newValue
        }),
    onClientsChannel: Joi.object({
        id: Joi.number().integer().empty("").default(null).optional(),
        ignoreSgList: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
        format: Joi.string().empty("").default(null).optional(),
    }).custom((value) => {
        if (!(value.id && value.format)) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
            return value
        }
    }),
    onAdminsChannel: Joi.object({
        id: Joi.number().integer().empty("").default(null).optional(),
        adminSgList: Joi.array().items(Joi.number().integer().optional().default(0)).empty("").default(null).optional(),
        format: Joi.string().empty("").default(null).optional(),
    }).custom(emptyChecker),
    priceChannels: Joi.object().pattern(
        Joi.string(),
        Joi.object({
            id: Joi.number().integer().required(),
            format: Joi.string().required(),
        })
    ),
    jailChannels: Joi.array()
        .sparse()
        .items(
            Joi.object({
                id: Joi.number().integer().empty("").default(null).optional(),
                sgId: Joi.number().integer().empty("").default(null).optional(),
                time: Joi.number().integer().max(1000).empty("").default(null).optional(),
                format: Joi.string().empty("").default(null).optional(),
            }).custom((value) => {
                if (!(value.id && value.sgId && value.time)) {
                    return undefined
                } else {
                    Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
                    return value
                }
            })
        )
        .custom((value) => {
            let newValue = value.filter((item) => item !== undefined)
            return newValue.length == 0 ? undefined : newValue
        }),
    newClientsChannel: Joi.object({
        id: Joi.number().integer().empty("").default(null).optional(),
        clientDesc: Joi.string().empty("").default(null).optional(),
        descFormat: Joi.string().empty("").default(null).optional(),
        format: Joi.string().empty("").default(null).optional(),
    }).custom((value) => {
        if (!(value.id && value.format)) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
            return value
        }
    }),
    banClientsChannel: Joi.object({
        id: Joi.number().integer().empty("").default(null).optional(),
        nameFormat: Joi.string().empty("").default(null).optional(),
        descriptionFormat: Joi.string().empty("").default(null).optional(),
    }).custom((value) => {
        if (!(value.id && value.nameFormat)) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
            return value
        }
    }),
    weathersChannels: Joi.object().pattern(
        Joi.string(),
        Joi.object({
            id: Joi.number().integer().required(),
            format: Joi.string().required(),
        })
    ),
    sgInfoChannels: Joi.array()
        .sparse()
        .items(
            Joi.object({
                id: Joi.number().integer().empty("").default(null).optional(),
                sgId: Joi.number().integer().empty("").default(null).optional(),
                nameFormat: Joi.string().empty("").default(null).optional(),
                descriptionFormat: Joi.string().empty("").default(null).optional(),
            }).custom((value) => {
                if (!(value.id && value.sgId && value.nameFormat)) {
                    return undefined
                } else {
                    Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
                    return value
                }
            })
        )
        .custom((value) => {
            let newValue = value.filter((item) => item !== undefined)
            return newValue.length == 0 ? undefined : newValue
        }),
    serverName: Joi.object({ format: Joi.string().empty("").default(null).optional() }),
    dynamicChannels: Joi.array()
        .sparse()
        .items(
            Joi.object({
                id: Joi.number().integer().empty("").default(null).optional(),
                minChannels: Joi.number().integer().empty("").default(null).optional(),
                maxChannels: Joi.number().integer().empty("").default(null).optional(),
                maxClients: Joi.number().integer().empty("").default(null).optional(),
                joinPower: Joi.number().integer().empty("").default(null).optional(),
                format: Joi.string().empty("").default(null).optional(),
                iconId: Joi.string().empty("").default(null).optional(),
            }).custom((value) => {
                // Ensure required fields are present but allow falsy values like 0
                if (value.id == null || value.format == null || value.minChannels == null || value.maxChannels == null || value.maxClients == null) {
                    return undefined // Mark object as invalid only if any required field is null
                }

                // Remove undefined keys (optional)
                Object.keys(value).forEach((key) => {
                    if (value[key] == undefined) {
                        delete value[key]
                    }
                })

                return value
            })
        )
        .custom((value) => {
            // Remove undefined items in the array
            const newValue = value.filter((item) => item !== undefined)
            return newValue.length === 0 ? undefined : newValue
        }),
    tempChannel: Joi.object({
        listenId: Joi.number().empty("").default(null).optional(),
        parentId: Joi.number().empty("").default(null).optional(),
        cgId: Joi.number().empty("").default(null).optional(),
        pokeFormat: Joi.string().empty("").default(null).optional(),
        nameFormat: Joi.string().empty("").default(null).optional(),
        iconId: Joi.string().empty("").default(null).optional(),
    }).custom((value) => {
        if (!(value.listenId && value.parentId && value.nameFormat)) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
            return value
        }
    }),
    autoRank: Joi.object({
        canUseIds: Joi.array().items(Joi.number().integer().empty("", NaN)).default(null).optional(),
        maxMsg: Joi.string().empty("").default(null).optional(),
        ranks: Joi.array()
            .items(
                Joi.object({
                    rankName: Joi.string().required(),
                    sgID: Joi.number().integer().required(),
                })
            )
            .empty("")
            .default(null)
            .optional(),
        msgFormat: Joi.string().empty("").default(null).optional(),
    }).custom((value) => {
        if (!value.ranks) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
        }
        return value
    }),
    autoCountry: Joi.object({
        countryList: Joi.array()
            .items(
                Joi.object({
                    countryName: Joi.string().required(),
                    sgID: Joi.number().integer().required(),
                })
            )
            .empty("")
            .default(null)
            .optional(),
        ignoreSgList: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
    }).custom((value) => {
        if (!value.countryList) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
        }
        return value
    }),
    autoOs: Joi.object({
        ignoreSgList: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
        windows: Joi.string().empty("").default(null).optional(),
        mac: Joi.string().empty("").default(null).optional(),
        linux: Joi.string().empty("").default(null).optional(),
        android: Joi.string().empty("").default(null).optional(),
        iOS: Joi.string().empty("").default(null).optional(),
    }),
    staffList: Joi.array()
        .sparse()
        .items(
            Joi.object({
                id: Joi.number().integer().empty("").default(null).optional(),
                staffSgList: Joi.array().items(Joi.object({ sgName: Joi.string().required(), sgID: Joi.number().integer().required() })),
                usersFormat: Joi.string().empty("").default(null).optional(),
                descFormat: Joi.string().empty("").default(null).optional(),
                clickable: Joi.bool().default(false),
            }).custom(emptyChecker)
        )
        .custom((value) => {
            // Remove undefined items in the array
            const newValue = value.filter((item) => item !== undefined)
            return newValue.length === 0 ? undefined : newValue
        }),
    idleTime: Joi.object({
        ignoreSgList: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
        timeList: Joi.array()
            .items(
                Joi.object({
                    time: Joi.number().integer().required(),
                    iconID: Joi.string().required(),
                })
            )
            .empty("")
            .default(null)
            .optional(),
    }).custom((value) => {
        if (!value.timeList) {
            return undefined
        } else {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
        }
        return value
    }),
    deathRoomChannel: Joi.object({
        id: Joi.number().integer().empty("").default(null).optional(),
        ignoreSgList: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
        msg: Joi.string().empty("").default(null).optional(),
        kickMsg: Joi.string().empty("").default(null).optional(),
    }).custom((value) => {
        if (value.id && value.msg) {
            Object.keys(value).forEach((key) => (value[key] == undefined ? delete value[key] : null))
        }
        return value
    }),
    multiRank: Joi.object({
        rankId: Joi.number().integer().empty("").default(null).optional(),
        multiRanks: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
    }).custom(emptyChecker),
    moveRequest: Joi.object({
        canUseList: Joi.array().items(Joi.number().integer()).empty("").default(null).optional(),
        joinMsg: Joi.string().empty("").default(null).optional(),
        moveMsg: Joi.string().empty("").default(null).optional(),
    }).custom(emptyChecker),
    forbiddenMsgNotify: Joi.object({
        sgListToNotify: Joi.array().sparse().items(Joi.number().integer()).empty("").default(null).optional(),
        forbiddenWords: Joi.array().sparse().items(Joi.string()).empty("").default(null).optional(),
        pokeFormat: Joi.string().required(),
    }).custom(emptyChecker),
    voiceStatusChange: Joi.object({
        sgListToNotify: Joi.array().sparse().items(Joi.number().integer().empty("", null, " ")).empty("").default(null).optional(),
        ignoreSgList: Joi.array().sparse().items(Joi.number().integer()).empty("").default(null).optional(),
        pokeFormat: Joi.string().required(),
    }).custom(emptyChecker),
}).required()
