import { beforeAll, beforeEach, afterAll } from "vitest";
import models, { sequelize } from "../config/db.js";
import { usersSeed } from "../seeders/usersSeeder.js";
import { productsSeed } from "../seeders/productsSeeder.js";

beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Error: Running tests while not in test mode strictly prohibited. Run npm test first.");
    }
    
    const modelList = Object.values(sequelize.models);

    for (const model of modelList) {
        if (model.tableName !== "SequelizeMeta") {
            await model.destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true
            });
        }
    }

    await models.users.bulkCreate(usersSeed);
    await models.products.bulkCreate(productsSeed);
})

afterAll(async () => {
    await sequelize.close();
}, 60000);