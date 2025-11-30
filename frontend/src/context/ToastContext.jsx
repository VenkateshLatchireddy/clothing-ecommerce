import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let idCounter = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={styles.container} aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...styles.toast,
              ...(t.type === 'success' ? styles.success : styles.error),
            }}
          >
            <div style={styles.toastInner}>
              <div style={styles.icon}>{t.type === 'success' ? '✔' : '⚠'}</div>
              <div>{t.message}</div>
              <button onClick={() => removeToast(t.id)} style={styles.closeBtn}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 20,
    right: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    zIndex: 2000,
  },
  toast: {
    minWidth: 240,
    borderRadius: 8,
    padding: '10px 14px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    animation: 'slideIn 0.2s ease-out',
  },
  success: {
    background: '#28a745',
  },
  error: {
    background: '#dc3545',
  },
  icon: {
    marginRight: 10,
    background: 'white',
    color: '#28a745',
    borderRadius: '50%',
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
  },
  toastInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.9)',
    cursor: 'pointer',
    fontSize: 14,
    padding: 4,
  },
};

// Add a simple keyframe style to the document to make the toast slide in
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`;
  document.head.appendChild(style);
}

export default ToastProvider;
