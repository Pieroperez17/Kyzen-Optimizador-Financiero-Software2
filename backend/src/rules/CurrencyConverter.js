export default class CurrencyConverter {
  static SUPPORTED_CURRENCIES = ['PEN', 'USD'];

  constructor(exchangeRateUsd = 3.75) {
    this.exchangeRateUsd = exchangeRateUsd;
  }

  static normalize(currency) {
    const value = String(currency || 'PEN').toUpperCase();
    return CurrencyConverter.SUPPORTED_CURRENCIES.includes(value) ? value : 'PEN';
  }

  static round(amount) {
    return Math.round(amount * 100) / 100;
  }

  convert(amountInSoles, currency = 'PEN') {
    const amount = Number(amountInSoles) || 0;
    if (CurrencyConverter.normalize(currency) === 'USD') {
      return CurrencyConverter.round(amount / this.exchangeRateUsd);
    }
    return CurrencyConverter.round(amount);
  }

  toSoles(amount, currency = 'PEN') {
    const value = Number(amount) || 0;
    if (CurrencyConverter.normalize(currency) === 'USD') {
      return CurrencyConverter.round(value * this.exchangeRateUsd);
    }
    return CurrencyConverter.round(value);
  }
}
