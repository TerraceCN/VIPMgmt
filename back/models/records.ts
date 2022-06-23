import {
  DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes,
  ForeignKey, NonAttribute
} from 'sequelize';
import { logger, sequelize } from '.';

import { User } from './users';

export class Record extends Model<
  InferAttributes<Record>,
  InferCreationAttributes<Record>
> {
  declare id: CreationOptional<number>;

  declare userId: ForeignKey<User['id']>
  declare user?: NonAttribute<User>;

  declare operatorId: ForeignKey<User['id']>
  declare operator?: NonAttribute<User>;

  declare createdAt: CreationOptional<Date>;

  declare creditChange: number;

  declare description: string;
}

async function onCreate(record: Record) {
  const user = await User.findByPk(record.userId);
  if (user) {
    user.credit += record.creditChange;
    user.lastUpdate = record.createdAt;
    user.save();
  } else {
    logger.error(`User ${record.userId} not found when creating record ${record.id}`);
  }
}

async function onRemove(record: Record) {
  const user = await User.findByPk(record.userId)
  if (user) {
    user.credit -= record.creditChange;
    user.lastUpdate = record.createdAt;
    user.save();
  } else {
    logger.error(`User ${record.userId} not found when deleting record ${record.id}`);
  }
}

Record.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  createdAt: DataTypes.DATE,
  creditChange: DataTypes.INTEGER,
  description: DataTypes.STRING,
}, {
  sequelize,
  tableName: 'records',
  hooks: {
    afterCreate: onCreate,
    afterDestroy: onRemove,
    afterUpdate: async (record: Record) => {
      await onCreate(record);
      await onRemove(record);
    }
  }
});
