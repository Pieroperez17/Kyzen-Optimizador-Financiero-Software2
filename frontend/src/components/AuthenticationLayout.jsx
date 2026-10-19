import Brand from './Brand.jsx';

export default function AuthenticationLayout({ title, subtitle, children }) {
  return (
    <div className="authentication">
      <section className="authentication-panel">
        <Brand />
        <h1>Toma el control de tu dinero.</h1>
        <p>Registra tus ingresos y gastos, recibe alertas antes de exceder tu presupuesto y cumple tus metas de ahorro.</p>
        <ul>
          <li>Alertas cuando superas el 80 % de tu presupuesto</li>
          <li>Metas de ahorro en soles o dólares</li>
          <li>Reportes en CSV y PDF</li>
        </ul>
      </section>
      <section className="authentication-form">
        <div className="card authentication-card">
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
          {children}
        </div>
      </section>
    </div>
  );
}
