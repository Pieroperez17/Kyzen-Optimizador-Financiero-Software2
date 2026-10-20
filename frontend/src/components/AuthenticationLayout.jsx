import Brand from './Brand.jsx';
import HeroFlow from './flow/HeroFlow.jsx';

export default function AuthenticationLayout({ title, subtitle, children }) {
  return (
    <div className="authentication">
      <section className="authentication-panel">
        <Brand />
        <h1>Toma el control de tu dinero.</h1>
        <p>Registra tus ingresos y gastos, recibe alertas antes de exceder tu presupuesto y cumple tus metas de ahorro.</p>
        <HeroFlow />
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
