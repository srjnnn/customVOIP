// components/ui/toaster.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ---------------------------
// Global Toast Store
// ---------------------------
type ToastSubscriber = (toasts: Toast[]) => void;

const toastSubscribers = new Set<ToastSubscriber>();
let toasts: Toast[] = [];

function notifySubscribers() {
  for (const subscriber of toastSubscribers) {
    subscriber(toasts);
  }
}

function addToast(message: string, type: ToastType) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  notifySubscribers();
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  notifySubscribers();
}

// Exportable global toast API
export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
  info: (message: string) => addToast(message, "info"),
};

// ---------------------------
// Toaster Component
// ---------------------------
export const Toaster: React.FC = () => {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const subscriber: ToastSubscriber = (newToasts) => {
      setLocalToasts(newToasts);
    };
    toastSubscribers.add(subscriber);
    return () => {
      toastSubscribers.delete(subscriber);
    };
  }, []);

  const toastStyles = {
    success: "bg-green-500 text-neutral-100",
    error: "bg-red-500 text-neutral-100",
    info: "bg-blue-500 text-neutral-100",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {localToasts.map((toastItem) => (
          <motion.div
            key={toastItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "glass-effect p-4 rounded-lg shadow-lg flex items-center justify-between",
              toastStyles[toastItem.type]
            )}
          >
            <span>{toastItem.message}</span>
            <button onClick={() => removeToast(toastItem.id)}>
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
