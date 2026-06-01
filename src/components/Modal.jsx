import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidth = size === 'lg' ? '640px' : size === 'sm' ? '400px' : '520px';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.15s ease-out',
        }}
      />

      {/* Scroll Container */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          overflowY: 'auto',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          paddingTop: '3rem', paddingBottom: '3rem',
        }}
      >
        {/* Panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth,
            margin: '0 1rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '1.15rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              margin: 0,
            }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                color: 'var(--text-muted)', padding: '6px', borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                border: 'none', background: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
