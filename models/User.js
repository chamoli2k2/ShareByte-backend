import { DataTypes } from "sequelize";
import { db } from "../db.js";
import { constants } from "../constants.js";

export const User = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        // allowNull: false,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    type: {
        type: DataTypes.STRING,
        values: [
            constants.user.types.feeder,
            constants.user.types.needy
        ],
        allowNull: false,
    },

    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    bio: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    location_lat: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    location_long: {
        type: DataTypes.STRING,
        allowNull: true,
    },

}, {
    timestamps: true,
});
