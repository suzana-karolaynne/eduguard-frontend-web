import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled,
  loading,
  className = '',
  fullWidth = false,
  size = 'md',
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'all 0.15s ease',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    fontSize: size === 'sm' ? '0.8rem' : size === 'lg' ? '0.95rem' : '0.85rem',
    padding: size === 'sm' ? '0.4rem 0.875rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1.125rem',
    lineHeight: 1.4,
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: '#fff',
      boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)',
    },
    secondary: {
      backgroundColor: 'var(--surface-light)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#fff',
      boxShadow: '0 1px 3px rgba(239, 68, 68, 0.25)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1.5px solid var(--border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  const handleMouseEnter = (e) => {
    if (disabled || loading) return;
    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
    else if (variant === 'danger') e.currentTarget.style.backgroundColor = 'var(--danger-hover)';
    else if (variant === 'outline' || variant === 'ghost') e.currentTarget.style.backgroundColor = 'var(--surface-light)';
    else if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'var(--surface-dark)';
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleMouseLeave = (e) => {
    const vs = variantStyles[variant] || {};
    e.currentTarget.style.backgroundColor = vs.backgroundColor || '';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      )}
      {children}
    </button>
  );
};
