import { Link } from 'react-router-dom';
import AlertBanner from '../components/AlertBanner.jsx';
import CategoryBarChart from '../components/CategoryBarChart.jsx';
import TransactionList from '../components/TransactionList.jsx';
import { useAuthentication } from '../context/AuthenticationContext.jsx';
import { useFinancial } from '../context/FinancialContext.jsx';

export default function DashboardPage() {
  const { user } = useAuthentication();
  const { summary, formatter, loading } = useFinancial();

  if (loading || !summary) {
    return <p className="empty">Cargando tu panel financiero...</p>;
  }

  const { budgetStatus } = summary;
  const monthName = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Resumen de {monthName}</p>
          <h1>Hola, {user?.firstName}</h1>
        </div>
        <Link to="/movimientos" className="button">+ Nuevo movimiento</Link>
      </header>

      <AlertBanner alert={summary.alertBanner} />

      <section className="statistics">
        <article className="card statistic statistic-primary">
          <span>Balance total</span>
          <strong>{formatter.format(summary.balance)}</strong>
          <small>Ingresos menos gastos</small>
        </article>
        <article className="card statistic">
          <span>Ingresos del mes</span>
          <strong className="amount-income">{formatter.format(summary.monthlyIncome)}</strong>
        </article>
        <article className="card statistic">
          <span>Gastos del mes</span>
          <strong className="amount-expense">{formatter.format(summary.monthlyExpense)}</strong>
        </article>
        <article className="card statistic">
          <span>Presupuesto mensual</span>
          {summary.monthlyBudget ? (
            <>
              <strong>{formatter.format(summary.monthlyBudget)}</strong>
              <div className="progress">
                <div
                  className={`progress-fill ${budgetStatus.level === 'red' ? 'progress-danger' : ''}`}
                  style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
                />
              </div>
              <small>{budgetStatus.percentage}% utilizado</small>
            </>
          ) : (
            <Link to="/perfil" className="form-link">Configurar presupuesto</Link>
          )}
        </article>
      </section>

      <section className="grid-two">
        <article className="card">
          <h2>Gastos por categoría</h2>
          <CategoryBarChart categories={summary.expensesByCategory} formatter={formatter} />
        </article>
        <article className="card">
          <div className="card-header">
            <h2>Últimos movimientos</h2>
            <Link to="/movimientos" className="form-link">Ver todos</Link>
          </div>
          <TransactionList transactions={summary.recentTransactions} formatter={formatter} />
        </article>
      </section>
    </>
  );
}
