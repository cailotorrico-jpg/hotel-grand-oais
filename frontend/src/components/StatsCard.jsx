export default function StatsCard({ title, value, icon, color = 'var(--secondary)', subtitle }) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          <p style={styles.title}>{title}</p>
          <h2 style={{ ...styles.value, color }}>{value ?? '-'}</h2>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={{ ...styles.iconBox, background: `${color}18`, color }}>
          <span style={styles.icon}>{icon}</span>
        </div>
      </div>
      <div style={{ ...styles.accentBar, background: color }} />
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'default',
    position: 'relative',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem 1.25rem 1rem',
  },
  title: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
  },
  value: {
    fontSize: '1.75rem',
    fontWeight: '800',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-light)',
    marginTop: '0.25rem',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: '1.5rem',
  },
  accentBar: {
    height: '3px',
    width: '100%',
  },
};
