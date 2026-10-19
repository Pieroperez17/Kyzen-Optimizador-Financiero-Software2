import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

export default class User extends Model {
  static initialize(sequelize) {
    User.init(
      {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        birthDate: { type: DataTypes.DATEONLY, allowNull: false },
        phone: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        monthlyBudget: {
          type: DataTypes.DECIMAL(12, 2),
          get() {
            const value = this.getDataValue('monthlyBudget');
            return value === null ? null : Number(value);
          }
        },
        isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
        verificationCode: { type: DataTypes.STRING },
        verificationExpires: { type: DataTypes.DATE },
        resetPasswordToken: { type: DataTypes.STRING },
        resetPasswordExpires: { type: DataTypes.DATE }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        hooks: {
          beforeSave: async (user) => {
            if (user.changed('password')) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          }
        }
      }
    );
  }

  static associate(models) {
    User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
    User.hasMany(models.Goal, { foreignKey: 'userId', as: 'goals', onDelete: 'CASCADE' });
  }

  async matchPassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toProfileView() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      birthDate: this.birthDate,
      phone: this.phone,
      email: this.email,
      monthlyBudget: this.monthlyBudget,
      isVerified: this.isVerified
    };
  }
}
