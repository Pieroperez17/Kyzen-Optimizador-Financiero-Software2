import { NavLink, Outlet } from 'react-router-dom';
import { useAuthentication } from '../context/AuthenticationContext.jsx';
import { useFinancial } from '../context/FinancialContext.jsx';
import Brand from './Brand.jsx';

const NAVIGATION = [
  { path: '/', label: 'Panel', icon: '📊' },
  { path: '/movimientos', label: 'Movimientos', icon: '💸' },
  { path: '/metas', label: 'Metas', icon: '🎯' },
  { path: '/perfil', label: 'Perfil', icon: '👤' }
];

export default function Layout() {
  const { user, logout } = useAuthentication();
  const { currency, setCurrency } = useFinancial();

  return (
    <div className="application">
      <aside className="sidebar">
        <Brand />
        <nav className="navigation">
          {NAVIGATION.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className="navigation-link">
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="currency-switch" role="group" aria-label="Moneda de visualización">
            {['PEN', 'USD'].map((option) => (
              <button
                key={option}
                type="button"
                className={currency === option ? 'active' : ''}
                onClick={() => setCurrency(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="sidebar-user">
            <span className="avatar">{user?.firstName?.charAt(0) || 'K'}</span>
            <div>
              <strong>{user?.firstName} {user?.lastName}</strong>
              <button type="button" className="link-button" onClick={logout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
