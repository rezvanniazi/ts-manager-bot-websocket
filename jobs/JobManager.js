const { createLogger } = require("../utils/logger")
const Prices = require("../models/Prices")
const Weathers = require("../models/Weathers")
const axios = require("axios")
const cron = require("node-cron")
const { cronConfig } = require("../config")
const LicenseCheckJobs = require("./licenseCheckJobs")

const WEATHERS_API_KEY = "15690a7d974c094ad8dafdc6f24a1acd"
const citys = [
    {
        name: "tehran",
        lat: "35.72",
        lon: "51.33",
    },
    {
        name: "shiraz",
        lat: "29.59",
        lon: "52.58",
    },
    {
        name: "isfahan",
        lat: "32.65",
        lon: "51.66",
    },
    {
        name: "yazd",
        lat: "31.89",
        lon: "54.35",
    },
    {
        name: "tabriz",
        lat: "38.07",
        lon: "46.28",
    },
]

class JobManager {
    constructor() {
        this.logger = createLogger("cronjob", "service")
        this.licenseCheckJobs = new LicenseCheckJobs()
    }

    startAllJobs() {
        this.startPriceListJob()
        this.startWeatherListJob()
        this.licenseCheckJobs.startLicenseCheck()
    }

    startPriceListJob() {
        const job = async () => {
            await this.getPriceList().then(async (priceList) => {
                await Prices.truncate()
                await Prices.bulkCreate(Object.entries(priceList).map(([key, value]) => ({ name: key, amount: value })))
            })
        }

        job()

        cron.schedule(cronConfig.priceListCheck, job)
    }

    startWeatherListJob() {
        const job = async () => {
            try {
                const weatherList = await this.getWeatherList()
                await Weathers.truncate()
                await Weathers.bulkCreate(weatherList)
            } catch (err) {
                console.log(err)
                this.logger.error("Get Weather List Error")
            }
        }

        job()

        cron.schedule(cronConfig.weatherListCheck, job)
    }

    getPriceList() {
        return new Promise((resolve, reject) => {
            console.time("Scraping Prices")
            let data = {}

            const config = {
                method: "get",
                url: "https://BrsApi.ir/Api/Market/Gold_Currency.php?key=FreetNqRIgBPsq861fy98L098zYz44gj",
            }
            axios
                .request(config)
                .then((res) => {
                    if (res?.status !== 200) {
                        return reject()
                    }

                    const currency = res.data.currency
                    const cryptoCurrency = res.data.cryptocurrency
                    const usdPrice = currency.find((c) => c.symbol == "USD").price

                    data = {
                        usdPrice: usdPrice,
                        eurPrice: currency.find((c) => c.symbol == "EUR").price,
                        lirPrice: currency.find((c) => c.symbol == "TRY").price,
                        rublePrice: currency.find((c) => c.symbol == "RUB").price,
                        dinarPrice: currency.find((c) => c.symbol == "IQD").price * 10,
                        btcPrice: cryptoCurrency.find((c) => c.symbol == "BTC").price * usdPrice,
                        ethPrice: cryptoCurrency.find((c) => c.symbol == "ETH").price * usdPrice,
                        trxPrice: cryptoCurrency.find((c) => c.symbol == "TRX").price * usdPrice,
                        xrpPrice: cryptoCurrency.find((c) => c.symbol == "XRP").price * usdPrice,
                        lcoinPrice: cryptoCurrency.find((c) => c.symbol == "LTC").price * usdPrice,
                    }
                    console.timeEnd("Scraping Prices")
                    return resolve(data)
                })
                .catch(() => {
                    console.timeEnd("Scraping Prices")
                    this.logger.error(`Couldn't fetch price list`)
                    reject()
                })
        })
    }

    async getWeatherList() {
        let weatherList = []
        console.time("Scraping Weathers")
        await Promise.all(
            citys.map((city) => {
                return new Promise((resolve) => {
                    let config = {
                        method: "get",
                        maxBodyLength: Infinity,
                        url: `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${WEATHERS_API_KEY}`,
                        headers: {
                            Accept: "application/json",
                        },
                    }
                    axios
                        .request(config)
                        .then((res) => {
                            weatherList.push({ city: city.name, d: Math.round(res.data.main.temp) })
                            resolve()
                        })
                        .catch(() => {
                            resolve()
                            this.logger.error(`Couldn't fetch ${city.name}`)
                        })
                })
            })
        )
        console.timeEnd("Scraping Weathers")
        return weatherList
    }
}

module.exports = JobManager
