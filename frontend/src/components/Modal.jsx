import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthMap = { sm: '400px', md: '560px', lg: '750px' };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.modal, maxWidth: widthMap[size] || widthMap.md }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem',
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'fadeInUp 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '2px solid var(--secondary)',
    background: 'var(--primary)',
    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    padding: '0.25rem',
    lineHeight: 1,
    transition: 'color 0.2s',
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
};
