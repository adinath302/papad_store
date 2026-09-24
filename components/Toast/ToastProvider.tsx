"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const noop = () => {};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: noop };
  return ctx;
}

const config: Record<
  ToastType,
  { border: string; bg: string; dot: string; label: string }
> = {
  success: {
    border: "border-emerald-500",
    bg: "bg-emerald-500",
    dot: "bg-emerald-500",
    label: "Success",
  },
  error: {
    border: "border-red-500",
    bg: "bg-red-500",
    dot: "bg-red-500",
    label: "Error",
  },
  warning: {
    border: "border-amber-500",
    bg: "bg-amber-500",
    dot: "bg-amber-500",
    label: "Warning",
  },
  info: {
    border: "border-blue-500",
    bg: "bg-blue-500",
    dot: "bg-blue-500",
    label: "Info",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  const ctxValue = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}

      <div className="fixed bottom-6 right-6 z-[999] flex flex-col-reverse gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const c = config[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, rotate: 4, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, rotate: -2, scale: 0.9 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 260,
                  mass: 0.8,
                }}
                className="pointer-events-auto relative flex items-center gap-3 pl-3 pr-4 py-3 bg-white rounded-xl border-2 border-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-w-[300px] max-w-[400px]"
              >
                <div
                  className={`size-2.5 shrink-0 rounded-full ${c.dot} shadow-[0_0_6px] ${t.type === "success" ? "shadow-emerald-500/50" : t.type === "error" ? "shadow-red-500/50" : t.type === "warning" ? "shadow-amber-500/50" : "shadow-blue-500/50"}`}
                />

                <p className="text-sm font-semibold text-zinc-800 leading-snug flex-1">
                  {t.message}
                </p>

                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 text-zinc-300 hover:text-zinc-600 transition-colors cursor-pointer rounded-md hover:bg-zinc-100 shrink-0"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                </button>

                <div
                  className={`absolute bottom-0 left-0 h-[3px] rounded-full ${c.bg} toast-progress`}
                  style={{ animation: "shrink 3.8s linear forwards" }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: calc(100% - 2px); }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
