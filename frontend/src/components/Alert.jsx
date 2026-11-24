import { useState, useEffect } from 'react';

const typeConfig = {
  success: { bg: '#d4edda', border: '#28a745', color: '#155724', icon: '✅' },
  error: { bg: '#f8d7da', border: '#dc3545', color: '#721c24', icon: '❌' },
  warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404', icon: '⚠️' },
  info: { bg: '#d1ecf1', border: '#17a2b8', color: '#0c5460', icon: 'ℹ️' },
};

export default function Alert({ type = 'info', message, onClose }) {
  const [visible, setVisible] = useState(true);
  const cfg = typeConfig[type] || typeConfig.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        ...styles.alert,
        background: cfg.bg,
        borderColor: cfg.border,
        color: cfg.color,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      }}
    >
      <span style={styles.icon}>{cfg.icon}</span>
      <span style={styles.message}>{message}</span>
      <button
        style={{ ...styles.closeBtn, color: cfg.color }}
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
      >
        ✕
      </button>
    </div>
  );
}

const styles = {
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '4px solid',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
  },
  icon: {
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  message: {
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
    lineHeight: 1,
    opacity: 0.7,
  },
};
