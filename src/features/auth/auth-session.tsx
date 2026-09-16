import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const SESSION_KEY = 'commercepro-authenticated';

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(SESSION_KEY) === '1' || window.localStorage.getItem(SESSION_KEY) === '1';
}

export function startSession(remember = false) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  (remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, '1');
}

export function endSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <>{children}</>;
}
