export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  placeholder = '',
  disabled = false,
}) {
  const inputId = `field-${name}`;

  const handleChange = (e) => {
    onChange(e);
  };

  const renderInput = () => {
    const baseStyle = {
      ...styles.input,
      ...(error ? styles.inputError : {}),
      ...(disabled ? styles.inputDisabled : {}),
    };

    if (type === 'select') {
      return (
        <select
          id={inputId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          style={baseStyle}
        >
          <option value="">-- Seleccionar --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          style={{ ...baseStyle, resize: 'vertical', minHeight: '80px' }}
        />
      );
    }

    return (
      <input
        id={inputId}
        type={type}
        name={name}
        value={value || ''}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        style={baseStyle}
      />
    );
  };

  return (
    <div style={styles.fieldWrapper}>
      <label htmlFor={inputId} style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>
      {renderInput()}
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

const styles = {
  fieldWrapper: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text)',
  },
  required: {
    color: 'var(--danger)',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.85rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    color: 'var(--text)',
    background: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputError: {
    borderColor: 'var(--danger)',
    boxShadow: '0 0 0 2px rgba(220,53,69,0.15)',
  },
  inputDisabled: {
    background: '#f5f5f5',
    cursor: 'not-allowed',
    color: 'var(--text-muted)',
  },
  errorText: {
    display: 'block',
    marginTop: '0.25rem',
    fontSize: '0.78rem',
    color: 'var(--danger)',
  },
};
