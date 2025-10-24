require("dotenv").config()

module.exports = {
    port: process.env.PORT || 3000,
    staticToken: process.env.STATIC_TOKEN,
    mysqlConfig: {
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
    },
    cronConfig: {
        weatherListCheck: process.env.WEATHER_LIST_CHECK,
        priceListCheck: process.env.PRICE_LIST_CHECK,
    },
}
