const { mysqlConfig } = require("./config")

require("./models/Prices")
require("./models/TsManagerBots")
require("./models/Weathers")

async function sync() {
    const mysqlPool = mysql.createPool({
        host: mysqlConfig.host,
        user: mysqlConfig.username,
        password: mysqlConfig.password,
        multipleStatements: true,
    })

    await mysqlPool.query(`CREATE DATABASE IF NOT EXISTS ${mysqlConfig.database};`, [])

    const { sequelize } = require("./config/database")

    sequelize.sync({ force: true }).then(() => {
        console.log("Database synced!")
        process.exit()
    })
}

sync()
