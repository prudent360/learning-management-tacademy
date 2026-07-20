"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getProgress, setLessonComplete } from "@/app/actions/progress";

type Snapshot = { done: string[]; ready: boolean };

type Store = {
  snapshot: Snapshot;
  listeners: Set<() => void>;
  initialized: boolean;
};

const stores = new Map<string, Store>();

function getStore(slug: string): Store {
  let store = stores.get(slug);
  if (!store) {
    store = { snapshot: { done: [], ready: false }, listeners: new Set(), initialized: false };
    stores.set(slug, store);
  }
  return store;
}

function commit(slug: string, snapshot: Snapshot) {
  const store = getStore(slug);
  store.snapshot = snapshot;
  store.listeners.forEach((l) => l());
}

function ensureInit(slug: string) {
  const store = getStore(slug);
  if (store.initialized) return;
  store.initialized = true;

  getProgress(slug)
    .then((done) => commit(slug, { done, ready: true }))
    .catch((err) => {
      console.error(`Failed to load progress for ${slug}`, err);
      commit(slug, { done: [], ready: true });
    });
}

function subscribe(slug: string, cb: () => void) {
  const store = getStore(slug);
  store.listeners.add(cb);
  ensureInit(slug);
  return () => {
    store.listeners.delete(cb);
  };
}

const emptySnapshot: Snapshot = { done: [], ready: false };
const getServerSnapshot = () => emptySnapshot;

function persist(slug: string, done: string[]) {
  commit(slug, { done, ready: true });
}

function mutate(slug: string, lessonId: string, value: boolean) {
  const { done } = getStore(slug).snapshot;
  const has = done.includes(lessonId);
  if (value === has) return;

  const next = value ? [...done, lessonId] : done.filter((x) => x !== lessonId);
  persist(slug, next);

  setLessonComplete(slug, lessonId, value).catch((err) => {
    console.error(`Failed to persist lesson completion for ${slug}/${lessonId}`, err);
  });
}

/**
 * Tracks completed lesson ids for a course, backed by the server (Prisma).
 * One shared store per course slug — multiple components reading the same
 * course share a single fetch and stay in sync instantly on mutation.
 */
export function useProgress(slug: string) {
  const subscribeToSlug = useCallback((cb: () => void) => subscribe(slug, cb), [slug]);
  const getSnapshot = useCallback(() => getStore(slug).snapshot, [slug]);

  const { done, ready } = useSyncExternalStore(subscribeToSlug, getSnapshot, getServerSnapshot);

  const isDone = useCallback((id: string) => done.includes(id), [done]);
  const toggle = useCallback((id: string) => mutate(slug, id, !done.includes(id)), [slug, done]);
  const setComplete = useCallback(
    (id: string, value: boolean) => mutate(slug, id, value),
    [slug],
  );

  return { done, ready, isDone, toggle, setComplete, count: done.length };
}
