"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

export type ToastType = "error" | "success" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

const AUTO_DISMISS_MS = 4000;

let listeners: ((item: ToastItem) => void)[] = [];
let nextId = 0;

export function toast(message: string, type: ToastType = "error") {
  const item: ToastItem = {
    id: ++nextId,
    message,
    type,
  };

  for (const listener of listeners) {
    listener(item);
  }
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setToasts((current) => [...current, item]);
    };

    listeners.push(listener);

    return () => {
      listeners = listeners.filter(
        (candidate) => candidate !== listener
      );
    };
  }, []);

  useEffect(() => {
    const timers = toasts.map((item) =>
      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((candidate) => candidate.id !== item.id)
        );
      }, AUTO_DISMISS_MS)
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [toasts]);

  function dismiss(id: number) {
    setToasts((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  const icons: Record<ToastType, React.ReactNode> = {
    error: (
      <TriangleAlert
        size={18}
        className="shrink-0 text-hk-danger"
      />
    ),
    success: (
      <CheckCircle2
        size={18}
        className="shrink-0 text-hk-success"
      />
    ),
    info: (
      <Info size={18} className="shrink-0 text-hk-primary" />
    ),
  };

  return (
    <div
      className="
        pointer-events-none
        fixed
        inset-x-0
        top-4
        z-50
        flex
        flex-col
        items-center
        gap-2
        px-4
      "
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="alert"
          className="
            pointer-events-auto
            flex
            w-full
            max-w-sm
            items-start
            gap-3
            rounded-xl
            border
            border-hk-border
            bg-hk-surface
            px-4
            py-3
            shadow-lg
            animate-[hk-toast-in_0.2s_ease-out]
          "
        >
          {icons[item.type]}

          <p className="flex-1 text-sm font-medium text-hk-text">
            {item.message}
          </p>

          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label="Dismiss"
            className="
              text-hk-text-muted
              transition-colors
              hover:text-hk-text
            "
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}