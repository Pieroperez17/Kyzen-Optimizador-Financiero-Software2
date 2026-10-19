export default class AlertEngine {
  static ALERT_THRESHOLD = 0.8;

  static isInSameMonth(date, referenceDate) {
    const value = new Date(date);
    return value.getFullYear() === referenceDate.getFullYear() && value.getMonth() === referenceDate.getMonth();
  }

  static sumMonthlyExpenses(transactions, referenceDate = new Date()) {
    return transactions
      .filter((transaction) => transaction.type === 'gasto')
      .filter((transaction) => AlertEngine.isInSameMonth(transaction.date, referenceDate))
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }

  static evaluateBudgetAlert(monthlyExpenses, monthlyBudget) {
    const budget = Number(monthlyBudget);
    if (!budget || budget <= 0) {
      return {
        triggered: false,
        level: 'none',
        percentage: 0,
        message: 'Configura tu presupuesto mensual para activar las alertas.'
      };
    }

    const ratio = Number(monthlyExpenses) / budget;
    const percentage = Math.round(ratio * 100);

    if (ratio > 1) {
      return {
        triggered: true,
        level: 'red',
        percentage,
        message: `Superaste tu presupuesto mensual: llevas gastado el ${percentage}% del límite.`
      };
    }

    if (ratio > AlertEngine.ALERT_THRESHOLD) {
      return {
        triggered: true,
        level: 'red',
        percentage,
        message: `Atención: ya usaste el ${percentage}% de tu presupuesto mensual y superaste el umbral del 80%.`
      };
    }

    return {
      triggered: false,
      level: 'green',
      percentage,
      message: `Vas bien: llevas el ${percentage}% de tu presupuesto mensual.`
    };
  }
}
