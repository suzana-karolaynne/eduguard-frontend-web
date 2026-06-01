import React from 'react';

export const FormInput = ({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  accept,
  options = [],
  className = '',
  disabled = false,
}) => {
  const inputId = id || name;

  const inputStyle = {
    backgroundColor: 'var(--surface)',
    border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    color: 'var(--text-primary)',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'var(--font-sans)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.35rem',
    color: 'var(--text-secondary)',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--primary)';
    e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={className}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={3}
          className={className}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    }

    if (type === 'file') {
      return (
        <input
          id={inputId}
          type="file"
          name={name}
          onChange={onChange}
          required={required}
          accept={accept}
          disabled={disabled}
          style={{
            ...inputStyle,
            padding: '0.5rem',
            cursor: 'pointer',
          }}
        />
      );
    }

    return (
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  );
};
