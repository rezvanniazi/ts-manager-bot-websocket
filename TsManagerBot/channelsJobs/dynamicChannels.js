const { transformTeamSpeakResponse, channelEditor } = require("../queryHelper")

exports.dynamicChannels = async (bot) => {
    const dynamicChannels = bot.channels.dynamicChannels
    if (!dynamicChannels?.length) return

    console.log("Dynamic Channels Manager initialized")

    // Cache for channel states to prevent unnecessary updates
    const channelStateCache = new Map()

    // Throttle control with improved logic
    let updateInProgress = false
    const UPDATE_INTERVAL = 2000 // 2 seconds
    const DEBOUNCE_DELAY = 500 // Quick refresh after client moves

    class DynamicChannelManager {
        constructor() {
            this.updateTimeout = null
            this.initialized = false
        }

        // Process a single dynamic channel category
        async processChannelCategory(category) {
            try {
                const subChannels = await this.getSubChannels(category.id)
                const currentState = this.generateStateHash(subChannels)

                // Skip processing if nothing changed
                if (channelStateCache.get(category.id) === currentState) return
                channelStateCache.set(category.id, currentState)

                await this.updateExistingChannels(category, subChannels)
                await this.manageChannelCount(category, subChannels)
            } catch (error) {
                console.error(`Error processing channel category ${category.id}:`, error)
            }
        }

        // Get all subchannels for a category
        async getSubChannels(parentId) {
            try {
                const response = await bot.send("channellist -topic")
                return transformTeamSpeakResponse(response).filter((c) => c.pid == parentId)
            } catch (error) {
                console.error("Failed to fetch channel list:", error)
                return []
            }
        }

        // Generate a hash for state comparison
        generateStateHash(subChannels) {
            return JSON.stringify(
                subChannels.map((c) => ({
                    cid: c.cid,
                    name: c.channel_name,
                    clients: c.total_clients,
                    maxClients: c.channel_maxclients,
                }))
            )
        }

        // Update existing channels with changes
        async updateExistingChannels(category, subChannels) {
            const updatePromises = subChannels.map(async (subCh, index) => {
                if (!subCh?.cid) return

                const updates = {}
                const expectedName = category.format.replace("%s", index + 1)

                // Check for name changes
                if (subCh.channel_name !== expectedName) {
                    updates.channel_name = expectedName
                }

                // Check for max clients changes
                if (subCh.channel_maxclients !== category.maxClients) {
                    updates.channel_maxclients = category.maxClients
                }

                // Apply updates if any
                if (Object.keys(updates).length > 0) {
                    await channelEditor(bot, subCh.cid, updates).catch(() => {})
                }

                // Update permissions
                await this.updateChannelPermissions(category, subCh)
            })

            await Promise.all(updatePromises)
        }

        // Update channel permissions based on current state
        async updateChannelPermissions(category, subChannel) {
            try {
                const isFull = parseInt(subChannel.total_clients) >= category.maxClients && category.maxClients !== 0 && category.joinPower

                // Handle join power permission
                if (isFull) {
                    await bot.send("channeladdperm", {
                        cid: subChannel.cid,
                        permsid: "i_channel_needed_join_power",
                        permvalue: parseInt(category.joinPower),
                    })
                } else {
                    await bot.send("channeldelperm", {
                        cid: subChannel.cid,
                        permsid: "i_channel_needed_join_power",
                    })
                }

                // Handle icon ID
                if (category.iconId) {
                    await bot.send("channeladdperm", {
                        cid: subChannel.cid,
                        permsid: "i_icon_id",
                        permvalue: category.iconId | 0,
                    })
                }
            } catch (error) {
                console.error(`Permission update error for channel ${subChannel.cid}:`, error)
            }
        }

        // Manage channel creation and deletion
        async manageChannelCount(category, subChannels) {
            const emptyChannels = subChannels.filter((c) => parseInt(c.total_clients) === 0)

            // Delete excess empty channels (keep at least minChannels)
            if (emptyChannels.length > category.minChannels) {
                const channelsToDelete = emptyChannels.slice(category.minChannels)
                for (const channel of channelsToDelete) {
                    if (channel?.cid) {
                        await bot
                            .send("channeldelete", {
                                cid: channel.cid,
                                force: 1,
                            })
                            .catch(() => {})
                    }
                }
            }
            // Create new channels if needed
            const shouldCreateMore =
                emptyChannels.length < category.minChannels && (category.maxChannels == 0 || subChannels.length < category.maxChannels)

            if (shouldCreateMore) {
                const newChannelNumber = subChannels.length + 1
                const newName = category.format.replace("%s", newChannelNumber)

                try {
                    const newChannel = await bot.send("channelcreate", {
                        channel_name: newName,
                        cpid: category.id.toString(),
                        channel_flag_permanent: 1,
                    })

                    await bot.send("channeledit", {
                        ...newChannel,
                        channel_maxclients: category.maxClients == 0 ? undefined : category.maxClients || undefined,
                    })
                } catch (error) {
                    console.error(`Failed to create channel ${newName}:`, error)
                }
            }
        }

        // Main update method with debounce support
        async updateAllChannels(immediate = false) {
            if (updateInProgress) return

            // Clear any pending debounced update
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout)
                this.updateTimeout = null
            }

            if (immediate) {
                await this.executeUpdate()
            } else {
                this.updateTimeout = setTimeout(() => this.executeUpdate(), DEBOUNCE_DELAY)
            }
        }

        async executeUpdate() {
            if (updateInProgress) return

            updateInProgress = true
            try {
                await Promise.all(dynamicChannels.map((category) => this.processChannelCategory(category)))
            } finally {
                updateInProgress = false
            }
        }

        // Handle client moved event
        async handleClientMoved({ clid, ctid }) {
            // Check if client moved to one of our dynamic channel categories
            const isDynamicChannel = dynamicChannels.some(
                (category) =>
                    category.id === ctid ||
                    // You might want to check if it's a subchannel of our dynamic categories
                    this.isSubChannelOfDynamicCategory(ctid)
            )

            if (isDynamicChannel) {
                // Trigger a quick update to handle the movement
                await this.updateAllChannels(true)
            }
        }

        // Helper to check if a channel belongs to our dynamic categories
        async isSubChannelOfDynamicCategory(channelId) {
            // This would require additional logic to check channel parent relationships
            // For now, we'll trigger updates on any movement for simplicity
            return true
        }

        // Cleanup
        destroy() {
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout)
            }
        }
    }

    // Initialize the manager
    const manager = new DynamicChannelManager()

    // Store reference for cleanup
    bot.dynamicChannelManager = manager

    // Initial update
    await manager.updateAllChannels(true)

    // Set up periodic updates
    const intervalId = setInterval(() => manager.updateAllChannels(), UPDATE_INTERVAL)
    bot.intervalIds.push(intervalId)

    // Register client moved event handler
    bot.on("clientmoved", (data) => manager.handleClientMoved(data))

    // Alternative event registration if the above doesn't work
    // bot.clientmoved = (data) => manager.handleClientMoved(data);

    console.log(`Dynamic Channels Manager started for ${dynamicChannels.length} channel categories`)
}
