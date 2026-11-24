const variantColors = {
  success: { bg: '#d4edda', color: '#155724' },
  warning: { bg: '#fff3cd', color: '#856404' },
  danger: { bg: '#f8d7da', color: '#721c24' },
  info: { bg: '#d1ecf1', color: '#0c5460' },
  default: { bg: '#e9ecef', color: '#495057' },
};

export default function Badge({ text, variant = 'default' }) {
  const colors = variantColors[variant] || variantColors.default;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.65rem',
        borderRadius: '12px',
        fontSize: '0.78rem',
        fontWeight: '600',
        background: colors.bg,
        color: colors.color,
        whiteSpace: 'nowrap',
        letterSpacing: '0.3px',
      }}
    >
      {text}
    </span>
  );
}
