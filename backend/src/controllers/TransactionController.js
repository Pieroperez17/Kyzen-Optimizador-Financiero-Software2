import { Op } from 'sequelize';
import Validator from '../rules/Validator.js';
import PeriodRange from '../rules/PeriodRange.js';
import CsvExporter from '../rules/CsvExporter.js';
import HttpError from '../services/HttpError.js';

export default class TransactionController {
  constructor({ Transaction, Category, voucherStorage }) {
    this.Transaction = Transaction;
    this.Category = Category;
    this.voucherStorage = voucherStorage;
  }

  buildFilter(user, query) {
    const where = { userId: user.id };
    const range = new PeriodRange(query.period || 'all');
    if (range.start()) {
      where.date = { [Op.gte]: range.start(), [Op.lt]: range.end() };
    }
    if (['ingreso', 'gasto'].includes(query.type)) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.categoryId = Number(query.categoryId);
    }
    return where;
  }

  async findTransactions(user, query) {
    return this.Transaction.findAll({
      where: this.buildFilter(user, query),
      include: [{ model: this.Category, as: 'category' }],
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  }

  async resolveCategory(type, categoryId) {
    if (!categoryId) {
      return this.Category.findOne({ where: { name: 'Otros Ingresos' } });
    }
    const category = await this.Category.findByPk(Number(categoryId));
    if (!category || category.type !== type) {
      throw HttpError.badRequest('La categoría seleccionada no es válida para este tipo de movimiento.');
    }
    return category;
  }

  list = async (request, response) => {
    const transactions = await this.findTransactions(request.user, request.query);
    response.json({ success: true, data: transactions.map((transaction) => transaction.toView()) });
  };

  create = async (request, response) => {
    const { type, amount, description, date, categoryId, voucher } = request.body;
    const errors = Validator.validateTransactionInput({ type, amount, categoryId });
    if (errors.length) {
      throw HttpError.badRequest(errors.join(' '), errors);
    }

    const normalizedType = String(type).toLowerCase();
    const category = await this.resolveCategory(normalizedType, categoryId);

    let voucherUrl = null;
    if (voucher) {
      try {
        voucherUrl = this.voucherStorage.save(voucher).url;
      } catch (error) {
        throw HttpError.badRequest(error.message);
      }
    }

    const transaction = await this.Transaction.create({
      type: normalizedType,
      amount: Number(amount),
      description: String(description || '').trim() || 'Movimiento sin concepto',
      date: date ? new Date(date) : new Date(),
      userId: request.user.id,
      categoryId: category ? category.id : null,
      voucherUrl
    });
    await transaction.reload({ include: [{ model: this.Category, as: 'category' }] });

    response.status(201).json({
      success: true,
      message: 'Transacción guardada exitosamente.',
      data: transaction.toView()
    });
  };

  remove = async (request, response) => {
    const transaction = await this.Transaction.findOne({
      where: { id: Number(request.params.id), userId: request.user.id }
    });
    if (!transaction) {
      throw HttpError.notFound('El movimiento no existe.');
    }

    this.voucherStorage.remove(transaction.voucherUrl);
    await transaction.destroy();

    response.json({ success: true, message: 'Movimiento eliminado.' });
  };

  exportCsv = async (request, response) => {
    const transactions = await this.findTransactions(request.user, request.query);
    const period = request.query.period || 'all';
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="kyzen-movimientos-${period}.csv"`);
    response.send(`﻿${CsvExporter.buildTransactionsCsv(transactions)}`);
  };
}
