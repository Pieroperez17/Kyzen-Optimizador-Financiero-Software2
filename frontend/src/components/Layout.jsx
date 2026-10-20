import { NavLink, Outlet } from 'react-router-dom';
import { ArrowLeftRight, LayoutDashboard, LogOut, Target, UserRound } from 'lucide-react';
import { useAuthentication } from '../context/AuthenticationContext.jsx';
import { useFinancial } from '../context/FinancialContext.jsx';
import Brand from './Brand.jsx';

const NAVIGATION = [
  { path: '/', label: 'Panel', icon: LayoutDashboard },
  { path: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { path: '/metas', label: 'Metas', icon: Target },
  { path: '/perfil', label: 'Perfil', icon: UserRound }
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
              <item.icon size={19} aria-hidden="true" />
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
              <button type="button" className="link-button" onClick={logout}>
                <LogOut size={13} aria-hidden="true" /> Cerrar sesión
              </button>
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
