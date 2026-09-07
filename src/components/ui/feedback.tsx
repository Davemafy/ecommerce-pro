import { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      3200
    );
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((item) => (
          <div className={`toast ${item.type}`} key={item.id}>
            {item.type === 'error' ? <AlertCircle /> : <CheckCircle2 />}
            <span>{item.message}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToasts((current) => current.filter((x) => x.id !== item.id))}
            >
              <X />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

export function Modal({ open, title, description, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}><X /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}

export function ConfirmDialog({ open, title, description, onClose, onConfirm, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>Cancel</button>
          <button className={danger ? 'danger-button' : 'primary'} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <p>{danger ? 'This action cannot be undone.' : 'Please review the details before continuing.'}</p>
    </Modal>
  );
}
