export default class CategorySeeder {
  static CORE_CATEGORIES = [
    { name: 'Comida', type: 'gasto', icon: '🍔', color: '#6366f1' },
    { name: 'Viaje', type: 'gasto', icon: '✈️', color: '#818cf8' },
    { name: 'Transporte', type: 'gasto', icon: '🚌', color: '#93c5fd' },
    { name: 'Estudios', type: 'gasto', icon: '📚', color: '#22d3ee' },
    { name: 'Servicios', type: 'gasto', icon: '💡', color: '#34d399' },
    { name: 'Hogar', type: 'gasto', icon: '🏠', color: '#fca5a5' },
    { name: 'Otros', type: 'gasto', icon: '⚙️', color: '#cbd5e1' },
    { name: 'Otros Ingresos', type: 'ingreso', icon: '💰', color: '#34d399' }
  ];

  constructor(Category) {
    this.Category = Category;
  }

  async seed() {
    for (const category of CategorySeeder.CORE_CATEGORIES) {
      await this.Category.findOrCreate({ where: { name: category.name }, defaults: category });
    }
  }
}
