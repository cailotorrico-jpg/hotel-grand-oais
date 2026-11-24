export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>{text}</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid var(--border)',
    borderTopColor: 'var(--secondary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    marginTop: '1rem',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
};
