const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const TsManagerBots = sequelize.define(
    "TsManagerBots",
    {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        created: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        channels: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
            get() {
                const rawValue = this.getDataValue("channels")
                return rawValue ? JSON.parse(rawValue) : null
            },
            set(value) {
                this.setDataValue("channels", JSON.stringify(value))
            },
        },
        sv_new_clients: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
            get() {
                const rawValue = this.getDataValue("sv_new_clients")
                return rawValue ? JSON.parse(rawValue) : null
            },
            set(value) {
                this.setDataValue("sv_new_clients", JSON.stringify(value))
            },
        },

        conn: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
            get() {
                const rawValue = this.getDataValue("conn")
                return rawValue ? JSON.parse(rawValue) : null
            },
            set(value) {
                this.setDataValue("conn", JSON.stringify(value))
            },
        },
        template_name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true,
        },
    },
    {
        timestamps: false, // Since you have a custom 'created' timestamp
        hooks: {
            afterFind: async (result) => {
                const parse = (r) => {
                    if (!r) return
                    if (typeof r.conn === "string") r.conn = JSON.parse(r.conn)
                    if (typeof r.channels === "string") r.channels = JSON.parse(r.channels)
                    if (typeof r.permissions === "string") r.permissions = JSON.parse(r.permissions)
                }
                if (Array.isArray(result)) result.forEach(parse)
                else parse(result)
            },
        },
        indexes: [
            {
                unique: true,
                fields: ["template_name"],
            },
        ],
    }
)

module.exports = TsManagerBots
