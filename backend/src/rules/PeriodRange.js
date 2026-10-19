export default class PeriodRange {
  static PERIODS = ['month', 'year', 'all'];

  constructor(period = 'month', referenceDate = new Date()) {
    this.period = PeriodRange.PERIODS.includes(period) ? period : 'month';
    this.referenceDate = referenceDate;
  }

  start() {
    if (this.period === 'month') {
      return new Date(this.referenceDate.getFullYear(), this.referenceDate.getMonth(), 1);
    }
    if (this.period === 'year') {
      return new Date(this.referenceDate.getFullYear(), 0, 1);
    }
    return null;
  }

  end() {
    if (this.period === 'month') {
      return new Date(this.referenceDate.getFullYear(), this.referenceDate.getMonth() + 1, 1);
    }
    if (this.period === 'year') {
      return new Date(this.referenceDate.getFullYear() + 1, 0, 1);
    }
    return null;
  }
}
