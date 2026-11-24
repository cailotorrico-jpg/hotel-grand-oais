import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/huespedes', label: 'Huéspedes', icon: '👥' },
  { path: '/tipos-habitacion', label: 'Tipos de Habitación', icon: '🏷️' },
  { path: '/habitaciones', label: 'Habitaciones', icon: '🛏️' },
  { path: '/reservas', label: 'Reservas', icon: '📋' },
  { path: '/checkins', label: 'Check-In', icon: '✅' },
  { path: '/servicios', label: 'Servicios', icon: '🍽️' },
  { path: '/consumos', label: 'Consumos', icon: '🛒' },
  { path: '/facturas', label: 'Facturación', icon: '💰' },
  { path: '/checkouts', label: 'Check-Out', icon: '🚪' },
  { path: '/bitacora', label: 'Bitácora', icon: '📜' },
  { path: '/lab-joins', label: 'Lab. JOIN', icon: '🔗' },
  { path: '/lab-transacciones', label: 'Lab. Transacciones', icon: '⚡' },
];

const pageNames = {
  '/': 'Dashboard',
  '/huespedes': 'Gestión de Huéspedes',
  '/tipos-habitacion': 'Tipos de Habitación',
  '/habitaciones': 'Gestión de Habitaciones',
  '/reservas': 'Gestión de Reservas',
  '/checkins': 'Check-In',
  '/servicios': 'Catálogo de Servicios',
  '/consumos': 'Consumos de Huéspedes',
  '/facturas': 'Facturación',
  '/checkouts': 'Check-Out',
  '/bitacora': 'Bitácora del Sistema',
};

export default function Layout({ children }) {
  const location = useLocation();
  const [dateTime, setDateTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d) =>
    d.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (d) =>
    d.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const currentPage = pageNames[location.pathname] || 'Hotel Grand Oasis';

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarCollapsed ? '70px' : '260px' }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <span style={styles.logoIcon}>🏨</span>
            {!sidebarCollapsed && (
              <div>
                <div style={styles.logoTitle}>HOTEL GRAND</div>
                <div style={styles.logoSubtitle}>OASIS</div>
              </div>
            )}
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
              end={item.path === '/'}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          {!sidebarCollapsed && (
            <span style={styles.footerText}>© 2024 Grand Oasis</span>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ ...styles.mainWrapper, marginLeft: sidebarCollapsed ? '70px' : '260px' }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              style={styles.toggleBtn}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '☰' : '✕'}
            </button>
            <h1 style={styles.pageTitle}>{currentPage}</h1>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.dateTimeBox}>
              <span style={styles.dateText}>📅 {formatDate(dateTime)}</span>
              <span style={styles.timeText}>🕐 {formatTime(dateTime)}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--background)',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    zIndex: 1000,
    overflow: 'hidden',
    boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
  },
  sidebarHeader: {
    padding: '1.5rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#c9a84c',
    letterSpacing: '2px',
    whiteSpace: 'nowrap',
  },
  logoSubtitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#e6c200',
    letterSpacing: '4px',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    padding: '0.75rem 0.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(201, 168, 76, 0.2)',
    color: '#c9a84c',
    fontWeight: '600',
    borderLeft: '3px solid #c9a84c',
  },
  navIcon: {
    fontSize: '1.15rem',
    flexShrink: 0,
    width: '28px',
    textAlign: 'center',
  },
  navLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    whiteSpace: 'nowrap',
  },
  mainWrapper: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '64px',
    background: '#ffffff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: 'var(--primary)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  pageTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  dateTimeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  content: {
    flex: 1,
    padding: '1.5rem 2rem 2rem',
  },
};
