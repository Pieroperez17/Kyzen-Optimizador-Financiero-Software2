import { Sequelize } from 'sequelize';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';

export default class Database {
  constructor(databaseConfiguration) {
    this.sequelize = new Sequelize(
      databaseConfiguration.name,
      databaseConfiguration.user,
      databaseConfiguration.password,
      {
        host: databaseConfiguration.host,
        port: databaseConfiguration.port,
        dialect: 'postgres',
        logging: false
      }
    );
    this.models = { User, Category, Transaction, Goal };
    Object.values(this.models).forEach((model) => model.initialize(this.sequelize));
    Object.values(this.models).forEach((model) => model.associate(this.models));
  }

  async connect() {
    await this.sequelize.authenticate();
    await this.sequelize.sync();
  }

  async close() {
    await this.sequelize.close();
  }
}
