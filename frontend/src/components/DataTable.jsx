export default function DataTable({ columns = [], data = [], onEdit, onDelete, loading = false }) {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Cargando datos...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyIcon}>📭</span>
        <p style={styles.emptyText}>No se encontraron registros</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={styles.th}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
              {columns.map((col) => (
                <td key={col.key} style={styles.td}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <div style={styles.actionBtns}>
                    {onEdit && (
                      <button
                        style={styles.editBtn}
                        onClick={() => onEdit(row)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => onDelete(row)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    background: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.85rem 1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#fff',
    background: 'var(--primary)',
    borderBottom: '2px solid var(--secondary)',
    whiteSpace: 'nowrap',
    fontSize: '0.85rem',
    letterSpacing: '0.3px',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-light)',
    verticalAlign: 'middle',
  },
  trEven: {
    background: '#ffffff',
    transition: 'background 0.15s',
  },
  trOdd: {
    background: '#fafbfc',
    transition: 'background 0.15s',
  },
  actionBtns: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  editBtn: {
    background: 'rgba(201,168,76,0.1)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '6px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    background: 'rgba(220,53,69,0.1)',
    border: '1px solid rgba(220,53,69,0.3)',
    borderRadius: '6px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border)',
    borderTopColor: 'var(--secondary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: 'var(--text-muted)',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '0.75rem',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
};
