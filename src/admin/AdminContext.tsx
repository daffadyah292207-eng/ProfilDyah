import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface AdminContextValue {
  notify: (message: string, kind?: ToastKind) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, kind }]);
      window.setTimeout(() => remove(id), 4800);
    },
    [remove],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <AdminContext.Provider value={value}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.kind === "success" ? "is-success" : toast.kind === "error" ? "is-error" : ""}`}
          >
            {toast.kind === "success" ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent-2)]" />
            ) : toast.kind === "error" ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#b23b32]" />
            ) : (
              <Info size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              className="text-[var(--muted)] hover:text-[var(--ink)]"
              onClick={() => remove(toast.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminToast must be used inside AdminToastProvider");
  return context;
}
