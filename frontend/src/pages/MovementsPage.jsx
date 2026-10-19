import { useCallback, useEffect, useRef, useState } from 'react';
import StatusMessage from '../components/StatusMessage.jsx';
import TransactionList from '../components/TransactionList.jsx';
import FormValidator from '../domain/FormValidator.js';
import { useFinancial } from '../context/FinancialContext.jsx';
import { financeService } from '../services/FinanceService.js';

const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export default function MovementsPage() {
  const { categories, formatter, addTransaction, removeTransaction } = useFinancial();
  const fileInput = useRef(null);
  const [type, setType] = useState('gasto');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today());
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ period: 'month', type: '' });
  const [transactions, setTransactions] = useState([]);
  const [listStatus, setListStatus] = useState(null);

  const availableCategories = categories.filter((category) => category.type === type);
  const validationMessage = FormValidator.validateTransaction({ type, amount, categoryId, description });

  const loadTransactions = useCallback(async () => {
    try {
      const result = await financeService.getTransactions(filters);
      setTransactions(result.data);
    } catch (error) {
      setListStatus({ type: 'error', text: error.message });
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const changeType = (newType) => {
    setType(newType);
    setCategoryId('');
  };

  const changeFile = (event) => {
    const selected = event.target.files[0] || null;
    const error = FormValidator.validateVoucher(selected);
    if (error) {
      setStatus({ type: 'error', text: error });
      event.target.value = '';
      setFile(null);
      return;
    }
    setStatus(null);
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validationMessage) {
      setStatus({ type: 'error', text: validationMessage });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const voucher = file ? { mimeType: file.type, data: await FormValidator.readFileAsDataUrl(file) } : undefined;
      await addTransaction({
        type,
        amount: Number(amount),
        description,
        date: new Date(`${date}T12:00:00`).toISOString(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        voucher
      });
      setStatus({ type: 'success', text: '¡Transacción guardada con éxito!' });
      setAmount('');
      setDescription('');
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      await loadTransactions();
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`¿Eliminar el movimiento "${transaction.description}"?`)) return;
    try {
      await removeTransaction(transaction.id);
      await loadTransactions();
    } catch (error) {
      setListStatus({ type: 'error', text: error.message });
    }
  };

  const handleExport = async () => {
    try {
      await financeService.exportTransactionsCsv(filters.period);
    } catch (error) {
      setListStatus({ type: 'error', text: error.message });
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ingresos y gastos</p>
          <h1>Movimientos</h1>
        </div>
      </header>

      <section className="grid-sidebar">
        <article className="card">
          <h2>Nuevo movimiento</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="segmented" role="group" aria-label="Tipo de movimiento">
              <button type="button" className={type === 'gasto' ? 'active expense' : ''} onClick={() => changeType('gasto')}>Gasto</button>
              <button type="button" className={type === 'ingreso' ? 'active income' : ''} onClick={() => changeType('ingreso')}>Ingreso</button>
            </div>
            <div className="form-row">
              <label>
                Monto (S/)
                <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
              </label>
              <label>
                Fecha
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
            </div>
            <label>
              Concepto
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. Almuerzo en la universidad" maxLength={120} required />
            </label>
            <label>
              Categoría {type === 'ingreso' && '(opcional)'}
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">{type === 'gasto' ? 'Selecciona una categoría' : 'Otros Ingresos'}</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                ))}
              </select>
            </label>
            {type === 'gasto' && !categoryId && <p className="hint hint-warning">La categoría es obligatoria para registrar un gasto.</p>}
            <label>
              Comprobante (opcional, JPG o PNG hasta 5MB)
              <input ref={fileInput} type="file" accept="image/jpeg,image/png" onChange={changeFile} />
            </label>
            <StatusMessage status={status} />
            <button type="submit" className="button" disabled={saving || Boolean(validationMessage)}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </article>

        <article className="card">
          <div className="card-header">
            <h2>Historial</h2>
            <button type="button" className="button button-secondary button-small" onClick={handleExport}>Exportar CSV</button>
          </div>
          <div className="filters">
            <select value={filters.period} onChange={(event) => setFilters({ ...filters, period: event.target.value })} aria-label="Periodo">
              <option value="month">Mes actual</option>
              <option value="year">Año actual</option>
              <option value="all">Todo</option>
            </select>
            <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} aria-label="Tipo">
              <option value="">Ingresos y gastos</option>
              <option value="ingreso">Solo ingresos</option>
              <option value="gasto">Solo gastos</option>
            </select>
          </div>
          <StatusMessage status={listStatus} />
          <TransactionList transactions={transactions} formatter={formatter} onDelete={handleDelete} />
        </article>
      </section>
    </>
  );
}
