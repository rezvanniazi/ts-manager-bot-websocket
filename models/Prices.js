const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Prices = sequelize.define(
    "Prices",
    {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true,
        },
        amount: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
    },
    {
        tableName: "Prices",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["name"],
            },
        ],
    }
)

module.exports = Prices
