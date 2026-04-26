/**
 * Central API client with cookie-based auth.
 *
 * The backend uses httpOnly cookies for both access and refresh tokens.
 * This client relies on `credentials: 'include'` so the browser automatically
 * sends those cookies.  No manual Authorization header is needed.
 *
 * When a 401 is received the client attempts a single silent refresh via
 * `/auth/refresh` (which rotates the httpOnly refresh cookie and issues a
 * new httpOnly access cookie).  If that also fails the auth store is cleared
 * and the user is redirected to `/login`.
 */

import { useAuthStore } from '@/stores/auth';
import { isProtectedPath } from '@/lib/auth/redirect';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mareservtaion-backend.vercel.app';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: unknown;
};

/** Extended options that allow any body value — apiFetchInternal stringifies objects. */
type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

/** Core fetch with automatic single-retry on 401 via /auth/refresh. */
async function apiFetchInternal<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}/api/v1${path}`;

  // Stringify body if it's a plain object/array (not FormData, Blob, string, etc.)
  let body: BodyInit | null | undefined = options.body as BodyInit | null | undefined;
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData) && !(options.body instanceof Blob)) {
    body = JSON.stringify(options.body);
  }

  const baseOpts: RequestInit = {
    ...options,
    body,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const res = await fetch(url, baseOpts);

  // ── 401 → silent refresh + single retry ──────────────────────
  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login' && path !== '/auth/register') {
    const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (refreshRes.ok) {
      // httpOnly cookies have been rotated — retry the original request.
      const retryRes = await fetch(url, {
        ...baseOpts,
        // Mark as retried so we don't loop forever.
        headers: { ...baseOpts.headers, 'X-Retry': '1' } as Record<string, string>,
      });

      if (retryRes.ok) {
        const json = await retryRes.json().catch(() => ({})) as Record<string, unknown>;
        return json as ApiResponse<T>;
      }

      // Still 401 after refresh — session is truly invalid.
      const store = useAuthStore.getState();
      store.clearAll();
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname || '/';
        if (isProtectedPath(currentPath)) {
          window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
        }
      }
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    // Refresh also failed — clear auth and redirect.
    const store = useAuthStore.getState();
    store.clearAll();
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname || '/';
      if (isProtectedPath(currentPath)) {
        window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
      }
    }
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
  // ─────────────────────────────────────────────────────────────

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(((json.message ?? json.error) || `HTTP ${res.status}`) as string);
  }

  return json as ApiResponse<T>;
}

/* ── Public API ─────────────────────────────────────────────── */

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return apiFetchInternal<T>(path, { method: 'GET', ...options });
}

export async function apiGetRaw<T = unknown>(path: string): Promise<T> {
  const res = await apiFetchInternal<T>(path, { method: 'GET' });
  return res as unknown as T;
}

export async function apiPostRaw<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await apiFetchInternal<T>(path, { method: 'POST', body: JSON.stringify(body) });
  return res as unknown as T;
}

export async function apiPatchRaw<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await apiFetchInternal<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  return res as unknown as T;
}

export async function apiDeleteRaw<T = unknown>(path: string): Promise<T> {
  const res = await apiFetchInternal<T>(path, { method: 'DELETE' });
  return res as unknown as T;
}

/** Upload a single image file; returns the public URL. */
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/uploads/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = (await res.json().catch(() => ({}))) as { data?: { url?: string }; message?: string };
  if (!res.ok) throw new Error(json.message || 'Upload failed.');
  if (!json.data?.url) throw new Error('Réponse upload invalide.');
  return json.data.url;
}

/** Convenience object mirroring the old API shape. */
export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
