import { useEffect, useState } from 'react';

const TOAST_DURATION_MS = 5000;

export interface ToastData {
  /** Changes on every new toast so the timer restarts even for an identical message. */
  id: number;
  message: string;
  onUndo: (() => void) | null;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!toast || paused) return;
    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast, paused, onDismiss]);

  useEffect(() => {
    setPaused(false);
  }, [toast?.id]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div
          key={toast.id}
          className="toast"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <span className="toast__message">{toast.message}</span>
          {toast.onUndo && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.onUndo?.();
                onDismiss();
              }}
              title="Ctrl+Z"
            >
              Отменить
            </button>
          )}
        </div>
      )}
    </div>
  );
}
