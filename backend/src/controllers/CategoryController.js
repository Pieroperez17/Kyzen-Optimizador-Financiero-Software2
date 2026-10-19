import HttpError from '../services/HttpError.js';

export default class CategoryController {
  constructor({ Category }) {
    this.Category = Category;
  }

  list = async (request, response) => {
    const where = ['ingreso', 'gasto'].includes(request.query.type) ? { type: request.query.type } : {};
    const categories = await this.Category.findAll({ where, order: [['type', 'ASC'], ['id', 'ASC']] });
    response.json({ success: true, data: categories.map((category) => category.toView()) });
  };

  create = async (request, response) => {
    const name = String(request.body.name || '').trim();
    const type = String(request.body.type || '').toLowerCase();
    if (!name || !['ingreso', 'gasto'].includes(type)) {
      throw HttpError.badRequest('La categoría necesita un nombre y un tipo (ingreso o gasto).');
    }
    if (await this.Category.findOne({ where: { name } })) {
      throw HttpError.conflict('Ya existe una categoría con ese nombre.');
    }

    const category = await this.Category.create({
      name,
      type,
      icon: request.body.icon || '🏷️',
      color: request.body.color || '#94A3B8'
    });
    response.status(201).json({ success: true, data: category.toView() });
  };
}
