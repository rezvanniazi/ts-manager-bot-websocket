const { staticToken } = require("../config")

exports.socketAuth = async (req, res, next) => {
    const isHandshake = req._query.sid === undefined
    if (!isHandshake) {
        return next()
    }
    const header = req.headers["x-api-key"]

    if (!header) {
        return next(new Error("no token"))
    }

    if (!header.startsWith("Token ")) {
        return next(new Error("invalid token"))
    }

    const token = header.substring(6)

    if (token === staticToken) {
        next()
    } else {
        return next(new Error("invalid token"))
    }
}
