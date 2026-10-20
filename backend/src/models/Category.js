import { DataTypes, Model } from 'sequelize';

export default class Category extends Model {
  static initialize(sequelize) {
    Category.init(
      {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        type: { type: DataTypes.ENUM('ingreso', 'gasto'), allowNull: false },
        icon: { type: DataTypes.STRING, defaultValue: 'tag' },
        color: { type: DataTypes.STRING, defaultValue: '#94A3B8' }
      },
      { sequelize, modelName: 'Category', tableName: 'Categories', timestamps: false }
    );
  }

  static associate(models) {
    Category.hasMany(models.Transaction, { foreignKey: 'categoryId', as: 'transactions' });
  }

  toView() {
    return { id: this.id, name: this.name, type: this.type, icon: this.icon, color: this.color };
  }
}
