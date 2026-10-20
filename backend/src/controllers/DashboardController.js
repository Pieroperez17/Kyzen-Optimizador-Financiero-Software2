import AlertEngine from '../rules/AlertEngine.js';

export default class DashboardController {
  constructor({ Transaction, Category, exchangeRateUsd }) {
    this.Transaction = Transaction;
    this.Category = Category;
    this.exchangeRateUsd = exchangeRateUsd;
  }

  static sumByType(transactions, type) {
    return transactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  static groupExpensesByCategory(transactions) {
    const groups = new Map();
    transactions
      .filter((transaction) => transaction.type === 'gasto')
      .forEach((transaction) => {
        const category = transaction.category;
        const key = category ? category.id : 0;
        if (!groups.has(key)) {
          groups.set(key, {
            name: category ? category.name : 'Sin categoría',
            icon: category ? category.icon : 'tag',
            color: category ? category.color : '#94A3B8',
            total: 0
          });
        }
        groups.get(key).total += transaction.amount;
      });
    return [...groups.values()].sort((first, second) => second.total - first.total);
  }

  summary = async (request, response) => {
    const referenceDate = new Date();
    const transactions = await this.Transaction.findAll({
      where: { userId: request.user.id },
      include: [{ model: this.Category, as: 'category' }],
      order: [['date', 'DESC'], ['id', 'DESC']]
    });

    const monthlyTransactions = transactions.filter((transaction) =>
      AlertEngine.isInSameMonth(transaction.date, referenceDate)
    );
    const monthlyExpense = AlertEngine.sumMonthlyExpenses(transactions, referenceDate);
    const budgetStatus = AlertEngine.evaluateBudgetAlert(monthlyExpense, request.user.monthlyBudget);

    response.json({
      success: true,
      data: {
        balance: DashboardController.sumByType(transactions, 'ingreso') - DashboardController.sumByType(transactions, 'gasto'),
        monthlyIncome: DashboardController.sumByType(monthlyTransactions, 'ingreso'),
        monthlyExpense,
        monthlyBudget: request.user.monthlyBudget,
        exchangeRateUsd: this.exchangeRateUsd,
        expensesByCategory: DashboardController.groupExpensesByCategory(monthlyTransactions),
        recentTransactions: transactions.slice(0, 5).map((transaction) => transaction.toView()),
        budgetStatus,
        alertBanner: budgetStatus.triggered ? budgetStatus : null
      }
    });
  };
}
