"use client";

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { subscribeToasts, type ToastInput, type ToastKind } from "@/lib/toast";
import { TrophyIcon, CheckCircleIcon, BellIcon, CloseIcon } from "@/components/icons";

type Toast = ToastInput & { id: number };

let counter = 0;

const kindStyle: Record<
  ToastKind,
  { accent: string; iconWrap: string; icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  xp: {
    accent: "border-l-brand-green",
    iconWrap: "bg-green-100 text-brand-green",
    icon: CheckCircleIcon,
  },
  level: {
    accent: "border-l-navy",
    iconWrap: "bg-navy text-white",
    icon: TrophyIcon,
  },
  badge: {
    accent: "border-l-orange",
    iconWrap: "bg-orange-50 text-orange-600",
    icon: TrophyIcon,
  },
  success: {
    accent: "border-l-brand-green",
    iconWrap: "bg-green-100 text-brand-green",
    icon: CheckCircleIcon,
  },
  info: {
    accent: "border-l-navy",
    iconWrap: "bg-navy-50 text-navy",
    icon: BellIcon,
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });

  useEffect(() => {
    const unsubscribe = subscribeToasts((input) => {
      // Dedupe identical toasts fired within a short window (guards against
      // duplicate emits from re-renders / StrictMode).
      const key = `${input.kind}|${input.title}|${input.message ?? ""}`;
      const now = Date.now();
      if (key === lastRef.current.key && now - lastRef.current.at < 1500) return;
      lastRef.current = { key, at: now };

      const id = ++counter;
      setToasts((ts) => [...ts, { ...input, id }]);
      const duration = input.durationMs ?? 4000;
      window.setTimeout(() => {
        setToasts((ts) => ts.filter((t) => t.id !== id));
      }, duration);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const dismiss = (id: number) => setToasts((ts) => ts.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => {
        const style = kindStyle[t.kind ?? "info"];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border border-line border-l-4 bg-surface p-3.5 shadow-lg ${style.accent}`}
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg ${style.iconWrap}`}
            >
              {t.emoji ? (
                <span aria-hidden>{t.emoji}</span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">{t.title}</p>
              {t.message && <p className="text-xs text-muted">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-surface-muted hover:text-slate-600"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
