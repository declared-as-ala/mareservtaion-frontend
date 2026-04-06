const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mareservtaion-backend.vercel.app';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: unknown;
};

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const direct = localStorage.getItem('accessToken');
  if (direct) return direct;
  try {
    const raw = localStorage.getItem('ma-reservation-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.accessToken ?? null;
    }
  } catch {}
  return null;
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  // Refresh token is stored in an httpOnly cookie; the refresh endpoint reads it server-side.
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    accessToken?: string;
    token?: string;
  };
  if (!res.ok) {
    const message = json.message || json.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  const token = json.accessToken ?? json.token;
  if (typeof token === 'string' && token) {
    setAccessToken(token);
    return token;
  }
  return null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  // Silent refresh on 401 (single retry)
  if (res.status === 401 && path !== '/auth/refresh') {
    try {
      await refreshAccessToken();
      const token2 = await getToken();
      const headers2: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token2) (headers2 as Record<string, string>)['Authorization'] = `Bearer ${token2}`;
      const res2 = await fetch(url, { ...options, headers: headers2, credentials: 'include' });
      const json2 = (await res2.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res2.ok) throw new Error(json2.message || json2.error || `HTTP ${res2.status}`);
      return json2 as ApiResponse<T>;
    } catch {
      // fallthrough to original error handling
    }
  }

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }
  return json as ApiResponse<T>;
}

/** Fetch and return raw JSON (backend returns array/object directly for many endpoints). */
export async function apiGetRaw<T = unknown>(path: string): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (res.status === 401 && path !== '/auth/refresh') {
    try {
      await refreshAccessToken();
      const token2 = await getToken();
      const headers2: HeadersInit = { 'Content-Type': 'application/json' };
      if (token2) (headers2 as Record<string, string>)['Authorization'] = `Bearer ${token2}`;
      const res2 = await fetch(url, { method: 'GET', headers: headers2, credentials: 'include' });
      const json2 = (await res2.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res2.ok) throw new Error(json2.message || json2.error || `HTTP ${res2.status}`);
      return json2 as T;
    } catch {
      // fallthrough
    }
  }

  if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
  return json as T;
}

/** PATCH and return raw JSON (admin endpoints return the updated entity directly). */
export async function apiPatchRaw<T = unknown>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body), credentials: 'include' });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (res.status === 401 && path !== '/auth/refresh') {
    try {
      await refreshAccessToken();
      const token2 = await getToken();
      const headers2: HeadersInit = { 'Content-Type': 'application/json' };
      if (token2) (headers2 as Record<string, string>)['Authorization'] = `Bearer ${token2}`;
      const res2 = await fetch(url, { method: 'PATCH', headers: headers2, body: JSON.stringify(body), credentials: 'include' });
      const json2 = (await res2.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res2.ok) throw new Error(json2.message || json2.error || `HTTP ${res2.status}`);
      return json2 as T;
    } catch {
      // fallthrough
    }
  }

  if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
  return json as T;
}

/** POST and return raw JSON (admin endpoints return the created entity directly). */
export async function apiPostRaw<T = unknown>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: 'include' });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (res.status === 401 && path !== '/auth/refresh') {
    try {
      await refreshAccessToken();
      const token2 = await getToken();
      const headers2: HeadersInit = { 'Content-Type': 'application/json' };
      if (token2) (headers2 as Record<string, string>)['Authorization'] = `Bearer ${token2}`;
      const res2 = await fetch(url, { method: 'POST', headers: headers2, body: JSON.stringify(body), credentials: 'include' });
      const json2 = (await res2.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res2.ok) throw new Error(json2.message || json2.error || `HTTP ${res2.status}`);
      return json2 as T;
    } catch {
      // fallthrough
    }
  }

  if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
  return json as T;
}

/** DELETE and return raw JSON. */
export async function apiDeleteRaw<T = unknown>(path: string): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, { method: 'DELETE', headers, credentials: 'include' });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (res.status === 401 && path !== '/auth/refresh') {
    try {
      await refreshAccessToken();
      const token2 = await getToken();
      const headers2: HeadersInit = { 'Content-Type': 'application/json' };
      if (token2) (headers2 as Record<string, string>)['Authorization'] = `Bearer ${token2}`;
      const res2 = await fetch(url, { method: 'DELETE', headers: headers2, credentials: 'include' });
      const json2 = (await res2.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res2.ok) throw new Error(json2.message || json2.error || `HTTP ${res2.status}`);
      return json2 as T;
    } catch {
      // fallthrough
    }
  }

  if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
  return json as T;
}

/** Upload a single image file; returns the public URL. */
export async function uploadImageFile(file: File): Promise<string> {
  const token = await getToken();
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/uploads/image`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message || 'Upload failed.');
  const data = (json as { data?: { url?: string } }).data;
  if (!data?.url) throw new Error('Réponse upload invalide.');
  return data.url;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};

export function setAccessToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
}

export function clearAccessToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
}
