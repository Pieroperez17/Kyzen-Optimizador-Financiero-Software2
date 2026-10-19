import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import SessionStorage from '../services/SessionStorage.js';
import MoneyFormatter from '../domain/MoneyFormatter.js';
import { financeService } from '../services/FinanceService.js';
import { useAuthentication } from './AuthenticationContext.jsx';

const FinancialContext = createContext(null);

export function FinancialProvider({ children }) {
  const { isAuthenticated } = useAuthentication();
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currency, setCurrencyState] = useState(SessionStorage.getCurrency());
  const [loading, setLoading] = useState(false);

  const refreshSummary = useCallback(async () => {
    const result = await financeService.getSummary();
    setSummary(result.data);
    return result.data;
  }, []);

  const loadCategories = useCallback(async () => {
    const result = await financeService.getCategories();
    setCategories(result.data);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSummary(null);
      return;
    }
    setLoading(true);
    Promise.all([refreshSummary(), loadCategories()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, refreshSummary, loadCategories]);

  const addTransaction = useCallback(async (data) => {
    const result = await financeService.createTransaction(data);
    await refreshSummary();
    return result;
  }, [refreshSummary]);

  const removeTransaction = useCallback(async (identifier) => {
    const result = await financeService.deleteTransaction(identifier);
    await refreshSummary();
    return result;
  }, [refreshSummary]);

  const setCurrency = useCallback((newCurrency) => {
    SessionStorage.saveCurrency(newCurrency);
    setCurrencyState(newCurrency);
  }, []);

  const formatter = useMemo(
    () => new MoneyFormatter(currency, summary ? summary.exchangeRateUsd : 3.75),
    [currency, summary]
  );

  const value = useMemo(
    () => ({ summary, categories, currency, formatter, loading, refreshSummary, addTransaction, removeTransaction, setCurrency }),
    [summary, categories, currency, formatter, loading, refreshSummary, addTransaction, removeTransaction, setCurrency]
  );

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
}

export function useFinancial() {
  return useContext(FinancialContext);
}
