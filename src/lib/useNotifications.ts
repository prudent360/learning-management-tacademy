"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/app/actions/notifications";

type Snapshot = { items: NotificationItem[]; unreadCount: number; ready: boolean };

const POLL_MS = 60_000;

let snapshot: Snapshot = { items: [], unreadCount: 0, ready: false };
const listeners = new Set<() => void>();
let initialized = false;

function commit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

/** Re-fetches from the server and notifies subscribers. Call right after any action that creates a notification, for instant feedback instead of waiting on the poll. */
export function refreshNotifications() {
  getNotifications()
    .then(({ items, unreadCount }) => commit({ items, unreadCount, ready: true }))
    .catch((err) => console.error("Failed to load notifications", err));
}

function ensureInit() {
  if (initialized) return;
  initialized = true;
  refreshNotifications();
  setInterval(refreshNotifications, POLL_MS);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureInit();
  return () => listeners.delete(cb);
}

const emptySnapshot: Snapshot = { items: [], unreadCount: 0, ready: false };
const getServerSnapshot = () => emptySnapshot;

/**
 * Shared notifications store (one shared subscription across every component
 * that renders it), mirroring the useProgress/useGamification pattern.
 */
export function useNotifications() {
  const state = useSyncExternalStore(subscribe, () => snapshot, getServerSnapshot);

  const markAllRead = useCallback(() => {
    commit({
      ...snapshot,
      unreadCount: 0,
      items: snapshot.items.map((n) => ({ ...n, read: true })),
    });
    markAllNotificationsRead().catch((err) =>
      console.error("Failed to mark all notifications read", err),
    );
  }, []);

  const markRead = useCallback((id: string) => {
    const item = snapshot.items.find((n) => n.id === id);
    if (!item || item.read) return;
    commit({
      ...snapshot,
      unreadCount: Math.max(0, snapshot.unreadCount - 1),
      items: snapshot.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    });
    markNotificationRead(id).catch((err) =>
      console.error("Failed to mark notification read", err),
    );
  }, []);

  return { ...state, markAllRead, markRead };
}
