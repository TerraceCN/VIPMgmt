import { Sequelize } from 'sequelize';

import { getLogger } from '../logging';
import { DB_URL } from '../config';

export const logger = getLogger('sequelize');
export const sequelize = new Sequelize(DB_URL, { logging: false });

export async function syncDatabase() {
  try {
    await sequelize.sync();
    logger.info('Database synced');
  } catch (err) {
    logger.error(`Failed to sync database: ${err}`);
    throw err;
  }
}

import { User } from './users';
import { Record } from './records';

User.hasMany(Record, { foreignKey: 'userId', as: 'cRecords' });
User.hasMany(Record, { foreignKey: 'operatorId', as: 'oRecords' });
Record.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Record.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

export { User, Record };
