const banClientsChannel = require("./channelsJobs/banClientsChannel")
const { clockChannelsHandler } = require("./channelsJobs/clockChannels")
const { dateChannelsHandler } = require("./channelsJobs/dateChannels")
const { deathRoomChannelHandler } = require("./channelsJobs/deathRoomChannel")
const { dynamicChannels } = require("./channelsJobs/dynamicChannels")
const newClientsChannelHandler = require("./channelsJobs/newClientsChannel")
const { onAdminsChannelHandler } = require("./channelsJobs/onAdminsChannel")
const { onClientsChannelHandler } = require("./channelsJobs/onClientsChannel")
const priceChannelsHandler = require("./channelsJobs/priceChannels")
const sgInfoChannelsHandler = require("./channelsJobs/sgInfoChannels")
const staffListChannelHandler = require("./channelsJobs/staffListChannels")
const tempChannelHandler = require("./channelsJobs/tempChannel")
const weathersChannelsHandler = require("./channelsJobs/weathersChannels")
const autoCountryHandler = require("./connectDisconnectJobs/autoCountry")
const autoOsHandler = require("./connectDisconnectJobs/autoOs")
const serverName = require("./connectDisconnectJobs/serverName")
const { idleUpdateHandler } = require("./idleTime/idleTime")
const initializeJailChannel = require("./jailHandlers/jailChannel")
const multiRankHandler = require("./serverGroupChangeJobs/multiRank")
const autoRankHelper = require("./textMessageJobs/autoRank")
const forbiddenMsgNotify = require("./textMessageJobs/forbiddenMsgNotify")
const moveRequestHandler = require("./textMessageJobs/moveRequest")
const voiceStatusChangeJob = require("./voiceStatusChangeJob/voiceStatusChangeJob")

module.exports = [
    banClientsChannel,
    clockChannelsHandler,
    dateChannelsHandler,
    deathRoomChannelHandler,
    dynamicChannels,
    newClientsChannelHandler,
    onAdminsChannelHandler,
    onClientsChannelHandler,
    priceChannelsHandler,
    sgInfoChannelsHandler,
    staffListChannelHandler,
    tempChannelHandler,
    weathersChannelsHandler,
    autoOsHandler,
    serverName,
    idleUpdateHandler,
    autoCountryHandler,
    multiRankHandler,
    initializeJailChannel,
    autoRankHelper,
    moveRequestHandler,
    forbiddenMsgNotify,
    voiceStatusChangeJob,
]
