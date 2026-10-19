import { useEffect, useState } from 'react';
import StatusMessage from '../components/StatusMessage.jsx';
import FormValidator from '../domain/FormValidator.js';
import { useAuthentication } from '../context/AuthenticationContext.jsx';
import { useFinancial } from '../context/FinancialContext.jsx';
import { authenticationService } from '../services/AuthenticationService.js';
import { financeService } from '../services/FinanceService.js';

export default function ProfilePage() {
  const { user, updateUser } = useAuthentication();
  const { currency, setCurrency, formatter, refreshSummary } = useFinancial();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' });
  const [budget, setBudget] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [reportPeriod, setReportPeriod] = useState('month');
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    if (!user) return;
    setProfile({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
    setBudget(user.monthlyBudget ?? '');
  }, [user]);

  const setStatus = (section, type, text) => setStatuses((current) => ({ ...current, [section]: { type, text } }));

  const handleProfile = async (event) => {
    event.preventDefault();
    try {
      const result = await authenticationService.updateProfile(profile);
      updateUser(result.user);
      setStatus('profile', 'success', result.message);
    } catch (error) {
      setStatus('profile', 'error', error.message);
    }
  };

  const handleBudget = async (event) => {
    event.preventDefault();
    try {
      const result = await authenticationService.updateBudget(budget === '' ? null : Number(budget));
      updateUser(result.user);
      await refreshSummary();
      setStatus('budget', 'success', result.message);
    } catch (error) {
      setStatus('budget', 'error', error.message);
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (!FormValidator.isValidPassword(passwords.newPassword)) {
      setStatus('password', 'error', 'La nueva contraseña debe tener al menos 8 caracteres, con letras y números.');
      return;
    }
    try {
      const result = await authenticationService.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '' });
      setStatus('password', 'success', result.message);
    } catch (error) {
      setStatus('password', 'error', error.message);
    }
  };

  const handlePdf = async () => {
    try {
      const result = await financeService.getTransactions({ period: reportPeriod });
      const { default: PdfReportGenerator } = await import('../domain/PdfReportGenerator.js');
      new PdfReportGenerator(formatter).generate({ user, transactions: result.data, period: reportPeriod });
      setStatus('report', 'success', 'Reporte PDF generado.');
    } catch (error) {
      setStatus('report', 'error', error.message);
    }
  };

  const handleCsv = async () => {
    try {
      await financeService.exportTransactionsCsv(reportPeriod);
      setStatus('report', 'success', 'Reporte CSV descargado.');
    } catch (error) {
      setStatus('report', 'error', error.message);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Configuración</p>
          <h1>Mi perfil</h1>
        </div>
      </header>

      <section className="grid-two">
        <article className="card">
          <h2>Datos personales</h2>
          <form className="form" onSubmit={handleProfile}>
            <div className="form-row">
              <label>
                Nombre
                <input value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} required />
              </label>
              <label>
                Apellido
                <input value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} required />
              </label>
            </div>
            <label>
              Celular
              <input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
            </label>
            <label>
              Correo electrónico
              <input value={user?.email || ''} disabled />
            </label>
            <StatusMessage status={statuses.profile} />
            <button type="submit" className="button">Guardar cambios</button>
          </form>
        </article>

        <div className="stack">
          <article className="card">
            <h2>Presupuesto mensual</h2>
            <p className="muted">Kyzen te alertará cuando tus gastos del mes superen el 80 % de este monto.</p>
            <form className="inline-form" onSubmit={handleBudget}>
              <input type="number" min="0" step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Monto en S/" aria-label="Presupuesto mensual en soles" />
              <button type="submit" className="button button-small">Guardar</button>
            </form>
            <StatusMessage status={statuses.budget} />
          </article>

          <article className="card">
            <h2>Moneda de visualización</h2>
            <p className="muted">Los montos se registran en soles y se muestran en la moneda elegida.</p>
            <div className="segmented" role="group" aria-label="Moneda">
              <button type="button" className={currency === 'PEN' ? 'active' : ''} onClick={() => setCurrency('PEN')}>Soles (PEN)</button>
              <button type="button" className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>Dólares (USD)</button>
            </div>
          </article>

          <article className="card">
            <h2>Exportar reportes</h2>
            <div className="inline-form">
              <select value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)} aria-label="Periodo del reporte">
                <option value="month">Mes actual</option>
                <option value="year">Año actual</option>
                <option value="all">Todo el historial</option>
              </select>
              <button type="button" className="button button-small" onClick={handlePdf}>PDF</button>
              <button type="button" className="button button-secondary button-small" onClick={handleCsv}>CSV</button>
            </div>
            <StatusMessage status={statuses.report} />
          </article>
        </div>

        <article className="card">
          <h2>Cambiar contraseña</h2>
          <form className="form" onSubmit={handlePassword}>
            <label>
              Contraseña actual
              <input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} autoComplete="current-password" required />
            </label>
            <label>
              Nueva contraseña
              <input type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} autoComplete="new-password" required />
            </label>
            <StatusMessage status={statuses.password} />
            <button type="submit" className="button">Actualizar contraseña</button>
          </form>
        </article>
      </section>
    </>
  );
}
