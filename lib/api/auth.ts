import { api } from './client';

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthMeResponse {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export async function login(body: LoginBody): Promise<{ accessToken: string; user: AuthMeResponse }> {
  const res = await api.post<{ accessToken?: string; token?: string; user?: AuthMeResponse }>('/auth/login', body);
  const data = res?.data ?? (res as unknown as Record<string, unknown>);
  const token = (data?.accessToken ?? data?.token) as string | undefined;
  const rawUser = data?.user as AuthMeResponse | undefined;
  if (!token || !rawUser) throw new Error('Réponse de connexion invalide');
  const user: AuthMeResponse = {
    _id: (rawUser as { id?: string }).id ?? rawUser._id ?? '',
    fullName: rawUser.fullName,
    email: rawUser.email,
    role: rawUser.role,
    createdAt: rawUser.createdAt,
  };
  return { accessToken: token, user };
}

export async function register(body: RegisterBody): Promise<{ accessToken: string; user: AuthMeResponse }> {
  const res = await api.post<{ accessToken?: string; token?: string; user?: AuthMeResponse; message?: string }>(
    '/auth/register',
    body
  );
  const data = res?.data ?? (res as unknown as Record<string, unknown>);
  const token = (data?.accessToken ?? data?.token) as string | undefined;
  const rawUser = data?.user as AuthMeResponse | undefined;
  if (!token || !rawUser) throw new Error((data?.message as string) || 'Inscription échouée');
  const user: AuthMeResponse = {
    _id: (rawUser as { id?: string }).id ?? rawUser._id ?? '',
    fullName: rawUser.fullName,
    email: rawUser.email,
    role: rawUser.role,
    createdAt: rawUser.createdAt,
  };
  return { accessToken: token, user };
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function fetchMe(): Promise<AuthMeResponse | null> {
  try {
    const res = await api.get<AuthMeResponse>('/auth/me');
    const data = res?.data ?? (res as unknown as AuthMeResponse);
    return data && data._id ? data : null;
  } catch {
    return null;
  }
}
