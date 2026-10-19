import { DataTypes, Model } from 'sequelize';

export default class Transaction extends Model {
  static initialize(sequelize) {
    Transaction.init(
      {
        type: { type: DataTypes.ENUM('ingreso', 'gasto'), allowNull: false },
        amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            return Number(this.getDataValue('amount'));
          }
        },
        description: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        voucherUrl: { type: DataTypes.STRING }
      },
      { sequelize, modelName: 'Transaction', tableName: 'Transactions' }
    );
  }

  static associate(models) {
    Transaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    Transaction.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'SET NULL' });
  }

  toView() {
    return {
      id: this.id,
      type: this.type,
      amount: this.amount,
      description: this.description,
      date: this.date,
      voucherUrl: this.voucherUrl,
      category: this.category ? this.category.toView() : null
    };
  }
}
