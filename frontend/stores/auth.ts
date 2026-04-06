'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken, clearAccessToken } from '@/lib/api/client';

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  clear: () => void;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, token) => {
        setAccessToken(token);
        set({ user, accessToken: token });
      },

      logout: () => {
        clearAccessToken();
        set({ user: null, accessToken: null });
      },

      clear: () => {
        clearAccessToken();
        set({ user: null, accessToken: null });
      },

      fetchMe: async () => {
        try {
          const res = await api.get<MeResponse>('/auth/me');
          const d = (res as { data?: MeResponse }).data ?? (res as unknown as MeResponse);
          if (d && (d.id || d._id)) {
            const user: User = {
              id: d.id ?? d._id ?? '',
              fullName: d.fullName,
              email: d.email,
              role: d.role,
              createdAt: d.createdAt,
            };
            set({ user });
            return user;
          }
        } catch {
          // If access token expired, try silent refresh once using the httpOnly cookie.
          try {
            const refreshRes = await api.post<unknown>('/auth/refresh', {});
            const raw = refreshRes as {
              accessToken?: string;
              token?: string;
              data?: { accessToken?: string; token?: string };
            };
            const token = raw.accessToken ?? raw.token ?? raw.data?.accessToken ?? raw.data?.token;
            if (typeof token === 'string' && token) {
              setAccessToken(token);
              // Retry fetching the user profile.
              const res2 = await api.get<MeResponse>('/auth/me');
              const d2 = (res2 as { data?: MeResponse }).data ?? (res2 as unknown as MeResponse);
              if (d2 && (d2.id || d2._id)) {
                const user: User = {
                  id: d2.id ?? d2._id ?? '',
                  fullName: d2.fullName,
                  email: d2.email,
                  role: d2.role,
                  createdAt: d2.createdAt,
                };
                set({ user, accessToken: token });
                return user;
              }
            }
          } catch {
            // ignore and fallthrough to clearing auth state
          }

          set({ user: null, accessToken: null });
          clearAccessToken();
        }
        return null;
      },
    }),
    {
      name: 'ma-reservation-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);

