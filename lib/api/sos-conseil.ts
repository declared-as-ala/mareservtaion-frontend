import { apiFetch, apiGetRaw, apiPatchRaw } from './client';

export interface SOSConseilPayload {
  fullName: string;
  phone: string;
  email?: string;
  occasionType: string;
  participantsCount: number;
  averageAgeRange: string;
  preferredRegion: string;
  preferredCategory: string;
  budgetRange: string;
  preferredDate?: string;
  preferredTime?: string;
  details?: string;
}

export interface SOSConseilRecord extends SOSConseilPayload {
  _id: string;
  status: 'new' | 'in_review' | 'contacted' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SOSConseilListResponse {
  success: boolean;
  data: SOSConseilRecord[];
  total: number;
  page: number;
  pages: number;
}

export async function submitSOSConseil(payload: SOSConseilPayload): Promise<{ success: boolean; data: SOSConseilRecord }> {
  const res = await apiFetch<SOSConseilRecord>('/sos-conseil', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { success: res.success, data: res.data };
}

export async function listSOSConseil(params?: { page?: number; status?: string }): Promise<SOSConseilListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.append('page', String(params.page));
  if (params?.status) sp.append('status', params.status);
  const q = sp.toString();
  return apiGetRaw<SOSConseilListResponse>(`/sos-conseil${q ? `?${q}` : ''}`);
}

export async function updateSOSConseilStatus(id: string, status: SOSConseilRecord['status']): Promise<SOSConseilRecord> {
  return apiPatchRaw<SOSConseilRecord>(`/sos-conseil/${id}/status`, { status });
}

export async function deleteSOSConseil(id: string): Promise<void> {
  const res = await apiFetch(`/sos-conseil/${id}`, { method: 'DELETE' });
  if (!res.success) throw new Error('Erreur lors de la suppression');
}
