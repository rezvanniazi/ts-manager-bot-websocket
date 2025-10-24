const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Weathers = sequelize.define(
    "Weathers",
    {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        d: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
    },
    {
        tableName: "Weathers",
        timestamps: false,
    }
)

module.exports = Weathers
