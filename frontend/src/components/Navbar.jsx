import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/mi-barrio', label: 'Mi barrio' },
  { to: '/guardados', label: 'Guardados' },
  { to: '/perfil', label: 'Mi perfil' },
];

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" aria-label="Ir al inicio">
          <Logo />
        </NavLink>

        {/* Enlaces escritorio */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/emergencia')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <span className="hidden sm:inline">Modo Emergencia</span>
            <span className="sm:hidden">SOS</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Enlaces móvil */}
      <nav
        className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden"
        aria-label="Principal móvil"
      >
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
