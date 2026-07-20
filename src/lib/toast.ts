export type ToastKind = "xp" | "level" | "badge" | "success" | "info";

export type ToastInput = {
  kind?: ToastKind;
  title: string;
  message?: string;
  /** Emoji from data (e.g. a badge icon); type icons are drawn as SVG. */
  emoji?: string;
  durationMs?: number;
};

type Listener = (t: ToastInput) => void;

const listeners = new Set<Listener>();

/** Fire a toast from anywhere (client-side). */
export function emitToast(t: ToastInput) {
  listeners.forEach((l) => l(t));
}

/** Subscribe the global Toaster; returns an unsubscribe fn. */
export function subscribeToasts(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
