import { Op } from 'sequelize';

export default class CategorySeeder {
  static CORE_CATEGORIES = [
    { name: 'Comida', type: 'gasto', icon: 'utensils', color: '#6366f1' },
    { name: 'Viaje', type: 'gasto', icon: 'plane', color: '#818cf8' },
    { name: 'Transporte', type: 'gasto', icon: 'bus', color: '#60a5fa' },
    { name: 'Estudios', type: 'gasto', icon: 'book-open', color: '#22d3ee' },
    { name: 'Servicios', type: 'gasto', icon: 'lightbulb', color: '#34d399' },
    { name: 'Hogar', type: 'gasto', icon: 'house', color: '#f87171' },
    { name: 'Otros', type: 'gasto', icon: 'shapes', color: '#94a3b8' },
    { name: 'Otros Ingresos', type: 'ingreso', icon: 'wallet', color: '#10b981' }
  ];

  static GOAL_ICONS = ['target', 'laptop', 'plane', 'graduation-cap', 'house', 'car', 'smartphone', 'gift'];

  constructor(Category, Goal) {
    this.Category = Category;
    this.Goal = Goal;
  }

  async seed() {
    for (const definition of CategorySeeder.CORE_CATEGORIES) {
      const [category] = await this.Category.findOrCreate({ where: { name: definition.name }, defaults: definition });
      if (category.icon !== definition.icon || category.color !== definition.color) {
        await category.update({ icon: definition.icon, color: definition.color });
      }
    }
    await this.Category.update({ icon: 'tag' }, { where: { icon: { [Op.notRegexp]: '^[a-z-]+$' } } });
    if (this.Goal) {
      await this.Goal.update(
        { categoryIcon: 'target' },
        { where: { categoryIcon: { [Op.notIn]: CategorySeeder.GOAL_ICONS } } }
      );
    }
  }
}
