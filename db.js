import { Sequelize } from "sequelize";

export const db = new Sequelize({
    dialect: "sqlite",
    storage: "./dump/database.db",
    // logging: console.info,
    logging: false,
});

