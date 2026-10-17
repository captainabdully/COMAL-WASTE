import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Toast + dialog replacements for react-native-toast-message and Alert.alert.
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const seq = useRef(0);

  const toast = useCallback(({ type = 'success', title, text }) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, type, title, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Resolves true on confirm, false on cancel. `cancelLabel: null` makes it a plain alert.
  const ask = useCallback((opts) => new Promise((resolve) => setDialog({ ...opts, resolve })), []);
  const close = (result) => { dialog?.resolve(result); setDialog(null); };

  const value = useMemo(() => ({ toast, ask }), [toast, ask]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="fixed top-3 inset-x-0 z-[100] flex flex-col items-center gap-2 px-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto w-full max-w-sm flex gap-3 items-start bg-white rounded-xl shadow-lg border-l-4 px-4 py-3"
            style={{ borderLeftColor: t.type === 'error' ? '#E74C3C' : '#2ECC71' }}>
            {t.type === 'error'
              ? <AlertCircle className="w-5 h-5 mt-0.5 text-[#E74C3C] shrink-0" />
              : <CheckCircle2 className="w-5 h-5 mt-0.5 text-[#2ECC71] shrink-0" />}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900">{t.title}</p>
              {t.text && <p className="text-sm text-slate-600 break-words">{t.text}</p>}
            </div>
          </div>
        ))}
      </div>
      {dialog && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-5" onClick={() => close(false)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-sm bg-white rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900">{dialog.title}</h2>
            {dialog.message && <p className="mt-2 text-slate-600 text-sm">{dialog.message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              {dialog.cancelLabel !== null && (
                <button onClick={() => close(false)} className="px-4 py-2 rounded-lg text-slate-600 font-semibold">{dialog.cancelLabel || 'Cancel'}</button>
              )}
              <button autoFocus onClick={() => close(true)}
                className={`px-4 py-2 rounded-lg text-white font-semibold ${dialog.destructive ? 'bg-red-600' : 'bg-green-700'}`}>
                {dialog.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
