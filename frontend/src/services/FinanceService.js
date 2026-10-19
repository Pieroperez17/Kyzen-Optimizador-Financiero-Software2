import { apiClient } from './ApiClient.js';

class FinanceService {
  constructor(client) {
    this.client = client;
  }

  static toQuery(filters) {
    const parameters = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) parameters.set(key, value);
    });
    const query = parameters.toString();
    return query ? `?${query}` : '';
  }

  getSummary() {
    return this.client.get('/dashboard/summary');
  }

  getCategories() {
    return this.client.get('/categories');
  }

  getTransactions(filters = {}) {
    return this.client.get(`/transactions${FinanceService.toQuery(filters)}`);
  }

  createTransaction(data) {
    return this.client.post('/transactions', data);
  }

  deleteTransaction(identifier) {
    return this.client.delete(`/transactions/${identifier}`);
  }

  exportTransactionsCsv(period) {
    return this.client.download(`/transactions/export?period=${period}`, `kyzen-movimientos-${period}.csv`);
  }

  getGoals(currency) {
    return this.client.get(`/goals?currency=${currency}`);
  }

  createGoal(data) {
    return this.client.post('/goals', data);
  }

  updateGoal(identifier, data) {
    return this.client.put(`/goals/${identifier}`, data);
  }

  deleteGoal(identifier) {
    return this.client.delete(`/goals/${identifier}`);
  }
}

export const financeService = new FinanceService(apiClient);
