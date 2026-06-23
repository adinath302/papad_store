"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

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

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, { bar: string; icon: string; bg: string }> = {
  success: {
    bar: "bg-emerald-500",
    icon: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  error: {
    bar: "bg-red-500",
    icon: "text-red-500",
    bg: "bg-red-50",
  },
  warning: {
    bar: "bg-amber-500",
    icon: "text-amber-500",
    bg: "bg-amber-50",
  },
  info: {
    bar: "bg-blue-500",
    icon: "text-blue-500",
    bg: "bg-blue-50",
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
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-3 pointer-events-none w-full max-w-[420px] px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = icons[t.type];
            const s = styles[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", damping: 24, stiffness: 300 }}
                className="pointer-events-auto relative flex items-start gap-3 w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-white/40 overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${s.bar}`} />

                <div className={`ml-4 mt-3.5 mb-3.5 ${s.icon}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 py-3.5 pr-10">
                  <p className="text-sm font-semibold text-stone-800 leading-snug">
                    {t.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="absolute top-2.5 right-2.5 p-1 text-stone-300 hover:text-stone-600 transition-colors cursor-pointer rounded-md hover:bg-stone-100"
                >
                  <X size={14} />
                </button>

                <div className={`absolute bottom-0 left-0 h-[3px] ${s.bar} animate-shrink`} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 4s linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
