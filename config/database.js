const { Sequelize } = require("sequelize")
const { mysqlConfig } = require("./index")

const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, {
    host: mysqlConfig.host,
    dialect: "mysql",
    logging: false, // Disable SQL query logging
})

module.exports = { sequelize }
