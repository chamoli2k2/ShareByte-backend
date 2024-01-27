import { DataTypes } from "sequelize";
import { db } from "../db.js";

export const Post = db.define("Post", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    images: {
        type: DataTypes.JSON,
        allowNull: false,
    },

    helpers_user_id: {
        type: DataTypes.JSON,
        allowNull: true,
    },

    needys_user_id: {
        type: DataTypes.JSON,
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
}, { timestamps: true });