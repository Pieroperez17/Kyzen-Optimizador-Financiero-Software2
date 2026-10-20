import { useCallback, useEffect, useState } from 'react';
import { CircleCheckBig, X } from 'lucide-react';
import CategoryIcon, { GOAL_ICONS } from '../components/CategoryIcon.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import MoneyFormatter from '../domain/MoneyFormatter.js';
import { useFinancial } from '../context/FinancialContext.jsx';
import { financeService } from '../services/FinanceService.js';

const EMPTY_FORM = { name: '', targetAmount: '', currentAmount: '', deadline: '', categoryIcon: 'target' };

function GoalCard({ goal, formatter, onContribute, onDelete }) {
  const [contribution, setContribution] = useState('');

  const submitContribution = async (event) => {
    event.preventDefault();
    if (!Number(contribution)) return;
    await onContribute(goal, Number(contribution));
    setContribution('');
  };

  return (
    <article className="card goal-card">
      <div className="goal-header">
        <span className="goal-icon"><CategoryIcon name={goal.categoryIcon} size={22} fallback="target" /></span>
        <div>
          <h3>{goal.name}</h3>
          <span className="muted">Hasta el {MoneyFormatter.formatDate(`${goal.deadline}T12:00:00`)}</span>
        </div>
        <button type="button" className="icon-button" aria-label={`Eliminar ${goal.name}`} onClick={() => onDelete(goal)}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="goal-amounts">
        <strong>{formatter.formatInCurrency(goal.currentAmount)}</strong>
        <span>de {formatter.formatInCurrency(goal.targetAmount)}</span>
      </div>
      <div className="progress">
        <div className="progress-fill progress-success" style={{ width: `${goal.progressPercentage}%` }} />
      </div>
      <dl className="goal-details">
        <div><dt>Avance</dt><dd>{goal.progressPercentage}%</dd></div>
        <div><dt>Cuota mensual</dt><dd>{formatter.formatInCurrency(goal.monthlyQuota)}</dd></div>
        <div><dt>Meses restantes</dt><dd>{goal.remainingMonths}</dd></div>
      </dl>
      {goal.progressPercentage >= 100 ? (
        <p className="status status-success status-icon"><CircleCheckBig size={16} aria-hidden="true" /> ¡Meta cumplida!</p>
      ) : (
        <form className="inline-form" onSubmit={submitContribution}>
          <input
            type="number"
            step="0.01"
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            placeholder={`Aporte en ${goal.currency}`}
            aria-label={`Aporte para ${goal.name}`}
          />
          <button type="submit" className="button button-small">Aportar</button>
        </form>
      )}
    </article>
  );
}

export default function GoalsPage() {
  const { currency, formatter } = useFinancial();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [listStatus, setListStatus] = useState(null);

  const loadGoals = useCallback(async () => {
    try {
      const result = await financeService.getGoals(currency);
      setGoals(result.data);
    } catch (error) {
      setListStatus({ type: 'error', text: error.message });
    }
  }, [currency]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await financeService.createGoal({ ...form, currentAmount: form.currentAmount || 0, currency });
      setForm(EMPTY_FORM);
      setStatus({ type: 'success', text: 'Meta creada correctamente.' });
      await loadGoals();
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    }
  };

  const handleContribute = async (goal, contribution) => {
    try {
      await financeService.updateGoal(goal.id, { contribution, currency });
      await loadGoals();
    } catch (error) {
      setListStatus({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`¿Eliminar la meta "${goal.name}"?`)) return;
    try {
      await financeService.deleteGoal(goal.id);
      await loadGoals();
    } catch (error) {
      setListStatus({ type: 'error', text: error.message });
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ahorro a largo plazo</p>
          <h1>Metas de ahorro</h1>
        </div>
        <span className="badge">Mostrando en {currency}</span>
      </header>

      <section className="grid-sidebar">
        <article className="card">
          <h2>Nueva meta</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Nombre de la meta
              <input name="name" value={form.name} onChange={updateField} placeholder="Ej. Laptop para la universidad" required />
            </label>
            <fieldset className="icon-picker">
              <legend>Ícono</legend>
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={form.categoryIcon === icon ? 'active' : ''}
                  onClick={() => setForm({ ...form, categoryIcon: icon })}
                  aria-label={`Ícono ${icon}`}
                >
                  <CategoryIcon name={icon} size={18} />
                </button>
              ))}
            </fieldset>
            <div className="form-row">
              <label>
                Monto objetivo ({currency})
                <input type="number" min="0.01" step="0.01" name="targetAmount" value={form.targetAmount} onChange={updateField} required />
              </label>
              <label>
                Ya ahorrado ({currency})
                <input type="number" min="0" step="0.01" name="currentAmount" value={form.currentAmount} onChange={updateField} />
              </label>
            </div>
            <label>
              Fecha límite
              <input type="date" name="deadline" value={form.deadline} onChange={updateField} required />
            </label>
            <StatusMessage status={status} />
            <button type="submit" className="button">Crear meta</button>
          </form>
        </article>

        <div>
          <StatusMessage status={listStatus} />
          {goals.length ? (
            <div className="goal-grid">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} formatter={formatter} onContribute={handleContribute} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <article className="card"><p className="empty">Todavía no tienes metas. Crea la primera para empezar a ahorrar.</p></article>
          )}
        </div>
      </section>
    </>
  );
}
