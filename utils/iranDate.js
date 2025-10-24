const { default: axios } = require("axios")

exports.dynamicDate = {
    interval: null,
    fetchInterval: null,
    date: null,

    // Clean all intervals
    destroy() {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval)
            this.fetchInterval = null
        }
    },

    update() {
        if (this.date) {
            this.date = new Date(this.date.getTime() + 1000)
        }
    },

    startUpdating() {
        this.destroy() // Clear existing intervals first

        this.interval = setInterval(() => this.update(), 1000)
        this.fetchInterval = setInterval(() => {
            this.fetchDateFromApi().catch((err) => {
                console.error("API fetch failed:", err)
            })
        }, 10 * 60 * 1000)
    },

    async fetchDateFromApi() {
        console.time("Get Date Interval")
        try {
            const response = await axios.get("http://api.timezonedb.com/v2.1/get-time-zone?key=0L8WN4IODEYS&format=json&zone=Asia/Tehran&by=zone")
            this.date = new Date(response.data.formatted)
            console.timeEnd("Get Date Interval")
        } catch {
            console.error("Something went wrong when fetching date")
            console.timeEnd("Get Date Interval")
        }
    },
}
