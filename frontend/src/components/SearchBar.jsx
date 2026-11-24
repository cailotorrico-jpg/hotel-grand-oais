export default function SearchBar({ placeholder = 'Buscar...', value, onChange }) {
  return (
    <div style={styles.wrapper}>
      <span style={styles.icon}>🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
      {value && (
        <button style={styles.clearBtn} onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '400px',
  },
  icon: {
    position: 'absolute',
    left: '0.85rem',
    fontSize: '1rem',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.6rem 2.5rem 0.6rem 2.75rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    background: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: 'var(--text)',
  },
  clearBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    lineHeight: 1,
  },
};
