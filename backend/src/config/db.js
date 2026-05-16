import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import initModels from '../models/init-models.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

let DB_URL = null;

if (process.env.NODE_ENV !== "test") {
  DB_URL = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@db:5432/${process.env.PG_DB}`;
}
else {
  DB_URL = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@db:5432/test_db`;
}

export const sequelize = new Sequelize(DB_URL);

const models = initModels(sequelize);

const backfillCompletedTransactionTimestamps = async () => {
  await sequelize.query(`
    UPDATE transactions
    SET completed_at = created_at
    WHERE status = 'completed'
      AND completed_at IS NULL
  `);
}

export const testDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    if (process.env.NODE_ENV !== 'test') {
      await sequelize.sync({ alter: true });
      await backfillCompletedTransactionTimestamps();
      console.log('Database synced (alter mode).');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export default models;
