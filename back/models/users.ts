import {
  DataTypes, Model, CreationOptional,
  Association, InferAttributes, InferCreationAttributes,
} from 'sequelize';
import { Op } from 'sequelize';
import { sequelize } from '.';
import { createHash, randomBytes } from 'crypto';

import { Record } from './records';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  
  declare password: string;  // SHA256(password + salt)
  declare salt: string;
  
  declare realname: string;
  declare phone: string;
  declare email: string;

  declare isAdmin: boolean;
  declare isDeleted: boolean;

  declare credit: number;
  declare lastUpdate: Date | null;

  declare static associations: {
    records: Association<User, Record>;
  }

  static async find(username: string) {
    return await this.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { realname: username },
          { email: username },
          { phone: username },
        ]
      }
    });
  }
  
  checkPassword(password: string): boolean {
    const hashed = createHash('sha256').update(password + this.salt).digest('hex');
    return hashed === this.password;
  }

  async setPassword(password: string) {
    this.salt = randomBytes(8).toString('hex');
    this.password = createHash('sha256').update(password + this.salt).digest('hex');
    await this.save();
  }

  static async genPassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hashed = createHash('sha256').update(password + salt).digest('hex');
    return { salt, hashed };
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(25),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  salt: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
  },
  realname: {
    type: DataTypes.STRING(25),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  credit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lastUpdate: {
    type: DataTypes.DATE,
  }
}, {
  sequelize,
  tableName: 'users',
  indexes: [
    { fields: ['realname'] },
  ]
});
