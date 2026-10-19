import { DataTypes, Model } from 'sequelize';

export default class Goal extends Model {
  static initialize(sequelize) {
    Goal.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        targetAmount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            return Number(this.getDataValue('targetAmount'));
          }
        },
        currentAmount: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          get() {
            return Number(this.getDataValue('currentAmount'));
          }
        },
        deadline: { type: DataTypes.DATEONLY, allowNull: false },
        categoryIcon: { type: DataTypes.STRING, defaultValue: '🎯' }
      },
      { sequelize, modelName: 'Goal', tableName: 'Goals' }
    );
  }

  static associate(models) {
    Goal.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
  }

  remainingAmount() {
    return Math.max(this.targetAmount - this.currentAmount, 0);
  }

  remainingMonths(referenceDate = new Date()) {
    const deadline = new Date(`${this.deadline}T00:00:00`);
    const months = (deadline.getFullYear() - referenceDate.getFullYear()) * 12
      + (deadline.getMonth() - referenceDate.getMonth());
    return Math.max(months, 1);
  }

  monthlyQuota(referenceDate = new Date()) {
    return this.remainingAmount() / this.remainingMonths(referenceDate);
  }

  progressPercentage() {
    if (this.targetAmount <= 0) {
      return 0;
    }
    return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
  }

  toGoalView(currencyConverter, currency = 'PEN') {
    return {
      id: this.id,
      name: this.name,
      categoryIcon: this.categoryIcon,
      deadline: this.deadline,
      currency,
      targetAmount: currencyConverter.convert(this.targetAmount, currency),
      currentAmount: currencyConverter.convert(this.currentAmount, currency),
      remainingAmount: currencyConverter.convert(this.remainingAmount(), currency),
      remainingMonths: this.remainingMonths(),
      monthlyQuota: currencyConverter.convert(this.monthlyQuota(), currency),
      progressPercentage: this.progressPercentage()
    };
  }
}
