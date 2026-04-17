'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
};

type AuthState = {
  user: User | null;
  /** True while the app is bootstrapping or validating the session. */
  isResolving: boolean;
  /** True when the store has finished its initial hydration from localStorage. */
  hasHydrated: boolean;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
  clearAll: () => void;
  /** Validate the current session by calling /me. Returns user or null. */
  fetchMe: () => Promise<User | null>;
};

type MeResponse = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
};

/**
 * Build headers with credentials:include for cookie-based auth.
 * The backend uses httpOnly cookies, so we don't need to manually
 * attach an Authorization header.
 */
function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
}

/** Map a backend user object to our User type. */
function mapUser(d: MeResponse): User {
  return {
    id: d.id ?? d._id ?? '',
    fullName: d.fullName,
    email: d.email,
    role: d.role,
    createdAt: d.createdAt,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isResolving: false,
      hasHydrated: false,

      setAuth: (user) => {
        set({ user, isResolving: false });
      },

      clearAll: () => {
        set({ user: null, isResolving: false });
      },

      logout: async () => {
        try {
          // Call backend to invalidate refresh token and clear httpOnly cookies.
          await fetch(`${API_BASE}/api/v1/auth/logout`, {
            method: 'POST',
            headers: authHeaders(),
            credentials: 'include',
          });
        } catch {
          // Even if the backend call fails, clear local state.
        } finally {
          set({ user: null, isResolving: false });

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      fetchMe: async () => {
        set({ isResolving: true });
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
            method: 'GET',
            headers: authHeaders(),
            credentials: 'include',
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const d = (await res.json()) as MeResponse;
          if (d && (d.id || d._id)) {
            const user = mapUser(d);
            set({ user, isResolving: false });
            return user;
          }
          throw new Error('Invalid response');
        } catch {
          // Session is invalid — try a silent refresh once.
          try {
            const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });

            if (!refreshRes.ok) {
              throw new Error(`Refresh failed: ${refreshRes.status}`);
            }

            // Refresh succeeded — httpOnly cookies have been updated.
            // Retry /me with the new session.
            const res2 = await fetch(`${API_BASE}/api/v1/auth/me`, {
              method: 'GET',
              headers: authHeaders(),
              credentials: 'include',
            });

            if (!res2.ok) {
              throw new Error(`HTTP ${res2.status}`);
            }

            const d2 = (await res2.json()) as MeResponse;
            if (d2 && (d2.id || d2._id)) {
              const user = mapUser(d2);
              set({ user, isResolving: false });
              return user;
            }
            throw new Error('Invalid response');
          } catch {
            // All refresh attempts failed — session is gone.
            set({ user: null, isResolving: false });
            return null;
          }
        }
      },
    }),
    {
      name: 'ma-reservation-auth',
      // Only persist the user object, NOT tokens.
      // The session is validated via httpOnly cookies on every bootstrap.
      partialize: (state) => ({ user: state.user }),
      // Notify when hydration is complete.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
