// Admin auth state — Sanctum Bearer token kept in localStorage and the
// currently-logged-in admin user cached alongside it.
//
// SSR-safe: every localStorage access is guarded by `isBrowser` so the
// module can be imported from server-rendered route loaders without
// throwing on Node.

import { useSyncExternalStore } from "react";
import type { AdminUser } from "./types";

const TOKEN_KEY = "la_admin_token";
const USER_KEY = "la_admin_user";

const isBrowser = typeof window !== "undefined";

// ----- raw storage helpers -----------------------------------------------

export function getStoredToken(): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AdminUser | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function persistSession(token: string, user: AdminUser): void {
  if (!isBrowser) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyChange();
}

export function clearSession(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyChange();
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

// ----- reactive subscription --------------------------------------------
// useSyncExternalStore lets components re-render when login/logout happens
// anywhere (including another tab via the `storage` event).

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyChange(): void {
  listeners.forEach((l) => l());
}

function subscribe(cb: Listener): () => void {
  if (!isBrowser) return () => {};
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Cached snapshot — critical for useSyncExternalStore. React calls
// snapshot() after every render to detect changes by reference equality;
// returning a fresh object literal on each call triggers an infinite
// re-render loop. We re-build the snapshot ONLY when the raw localStorage
// strings change (which we already broadcast via notifyChange / the
// `storage` event).
let cachedTokenRaw: string | null = null;
let cachedUserRaw: string | null = null;
let cachedSnapshot: { token: string | null; user: AdminUser | null } = { token: null, user: null };

function snapshot(): { token: string | null; user: AdminUser | null } {
  if (!isBrowser) return SERVER_SNAPSHOT;
  let tokenRaw: string | null = null;
  let userRaw: string | null = null;
  try {
    tokenRaw = window.localStorage.getItem(TOKEN_KEY);
    userRaw = window.localStorage.getItem(USER_KEY);
  } catch {
    // Some browsers throw when accessing localStorage in private mode.
  }
  if (tokenRaw === cachedTokenRaw && userRaw === cachedUserRaw) {
    return cachedSnapshot;
  }
  cachedTokenRaw = tokenRaw;
  cachedUserRaw = userRaw;
  let user: AdminUser | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as AdminUser;
    } catch {
      user = null;
    }
  }
  cachedSnapshot = { token: tokenRaw, user };
  return cachedSnapshot;
}

// Stable reference for SSR — same object every call.
const SERVER_SNAPSHOT: { token: null; user: null } = { token: null, user: null };

function serverSnapshot(): { token: null; user: null } {
  return SERVER_SNAPSHOT;
}

export function useAuthSession(): {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
} {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { ...state, isAuthenticated: state.token !== null };
}
