import Validator from '../rules/Validator.js';
import CurrencyConverter from '../rules/CurrencyConverter.js';
import HttpError from '../services/HttpError.js';

export default class GoalController {
  constructor({ Goal, currencyConverter }) {
    this.Goal = Goal;
    this.currencyConverter = currencyConverter;
  }

  async findOwnGoal(request) {
    const goal = await this.Goal.findOne({ where: { id: Number(request.params.id), userId: request.user.id } });
    if (!goal) {
      throw HttpError.notFound('La meta no existe.');
    }
    return goal;
  }

  list = async (request, response) => {
    const currency = CurrencyConverter.normalize(request.query.currency);
    const goals = await this.Goal.findAll({ where: { userId: request.user.id }, order: [['deadline', 'ASC']] });
    response.json({
      success: true,
      currency,
      data: goals.map((goal) => goal.toGoalView(this.currencyConverter, currency))
    });
  };

  create = async (request, response) => {
    const { name, targetAmount, currentAmount, deadline, categoryIcon } = request.body;
    const errors = Validator.validateGoalInput({ name, targetAmount, deadline });
    if (errors.length) {
      throw HttpError.badRequest(errors.join(' '), errors);
    }

    const currency = CurrencyConverter.normalize(request.body.currency);
    const goal = await this.Goal.create({
      name: name.trim(),
      targetAmount: this.currencyConverter.toSoles(targetAmount, currency),
      currentAmount: this.currencyConverter.toSoles(currentAmount || 0, currency),
      deadline,
      categoryIcon: categoryIcon || 'target',
      userId: request.user.id
    });

    response.status(201).json({
      success: true,
      message: 'Meta creada.',
      data: goal.toGoalView(this.currencyConverter, currency)
    });
  };

  update = async (request, response) => {
    const goal = await this.findOwnGoal(request);
    const currency = CurrencyConverter.normalize(request.body.currency);
    const { name, targetAmount, currentAmount, deadline, categoryIcon, contribution } = request.body;

    const errors = Validator.validateGoalInput({
      name: name ?? goal.name,
      targetAmount: targetAmount ?? goal.targetAmount,
      deadline: deadline ?? goal.deadline
    });
    if (errors.length) {
      throw HttpError.badRequest(errors.join(' '), errors);
    }

    if (name !== undefined) goal.name = name.trim();
    if (targetAmount !== undefined) goal.targetAmount = this.currencyConverter.toSoles(targetAmount, currency);
    if (currentAmount !== undefined) goal.currentAmount = this.currencyConverter.toSoles(currentAmount, currency);
    if (deadline !== undefined) goal.deadline = deadline;
    if (categoryIcon !== undefined) goal.categoryIcon = categoryIcon;

    if (contribution !== undefined) {
      const value = Number(contribution);
      if (!Number.isFinite(value) || value === 0) {
        throw HttpError.badRequest('El aporte debe ser un número distinto de 0.');
      }
      goal.currentAmount = Math.max(goal.currentAmount + this.currencyConverter.toSoles(value, currency), 0);
    }

    if (goal.currentAmount < 0) {
      throw HttpError.badRequest('El monto ahorrado no puede ser negativo.');
    }

    await goal.save();
    response.json({ success: true, message: 'Meta actualizada.', data: goal.toGoalView(this.currencyConverter, currency) });
  };

  remove = async (request, response) => {
    const goal = await this.findOwnGoal(request);
    await goal.destroy();
    response.json({ success: true, message: 'Meta eliminada.' });
  };
}
