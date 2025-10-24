const Joi = require("joi")
const { channelsSchema } = require("./channelsSchema")

exports.createBot = {
    templateName: Joi.string().required(),
    channels: channelsSchema,
    conn: Joi.object({
        host: Joi.string().required(),
        serverPort: Joi.number().integer().required(),
        queryPort: Joi.number().integer().required(),
        queryPassword: Joi.string().required(),
        username: Joi.string().required(),
        botName: Joi.string().required(),
    }).required(),
}

exports.deleteBot = {
    templateName: Joi.string().required(),
}
exports.connectBot = {
    templateName: Joi.string().required(),
}
exports.disconnectBot = {
    templateName: Joi.string().required(),
}
exports.reconnectBot = {
    templateName: Joi.string().required(),
}
exports.getBotInfo = {
    templateName: Joi.string().required(),
}
