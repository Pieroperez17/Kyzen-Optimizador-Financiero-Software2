export default class MoneyFormatter {
  static SYMBOLS = { PEN: 'S/', USD: 'US$' };

  constructor(currency = 'PEN', exchangeRateUsd = 3.75) {
    this.currency = currency;
    this.exchangeRateUsd = exchangeRateUsd;
  }

  convert(amountInSoles) {
    const amount = Number(amountInSoles) || 0;
    return this.currency === 'USD' ? amount / this.exchangeRateUsd : amount;
  }

  format(amountInSoles) {
    return this.formatInCurrency(this.convert(amountInSoles));
  }

  formatInCurrency(amount) {
    const value = Number(amount) || 0;
    const text = Math.abs(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${value < 0 ? '-' : ''}${MoneyFormatter.SYMBOLS[this.currency]} ${text}`;
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
