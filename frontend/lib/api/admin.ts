import { apiGetRaw, apiPatchRaw, apiPostRaw, api } from './client';

export interface AdminStats {
  totalUsers?: number;
  totalVenues?: number;
  totalReservations?: number;
  totalEvents?: number;
  confirmedReservations?: number;
  pendingReservations?: number;
  cancelledReservations?: number;
  reservationsToday?: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const res = await apiGetRaw<{ success?: boolean; data?: AdminStats }>('/admin/dashboard/stats');
    const data = (res as { data?: AdminStats })?.data ?? res;
    return (data as AdminStats) ?? {};
  } catch {
    return {};
  }
}

export async function fetchAdminReservations(params?: { status?: string; page?: number }) {
  try {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.page) sp.set('page', String(params.page));
    const qs = sp.toString();
    const res = await apiGetRaw<{ reservations?: unknown[] }>(`/admin/reservations${qs ? `?${qs}` : ''}`);
    const list = (res as { reservations?: unknown[] })?.reservations;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function fetchAdminVenues(params?: { page?: number; type?: string; city?: string; q?: string }) {
  try {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.type) sp.set('type', params.type);
    if (params?.city) sp.set('city', params.city);
    if (params?.q) sp.set('q', params.q);
    const qs = sp.toString();
    const res = await apiGetRaw<{ venues?: unknown[] }>(`/admin/venues${qs ? `?${qs}` : ''}`);
    const list = (res as { venues?: unknown[] })?.venues;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export type AdminVenuePayload = {
  name?: string;
  type?: string;
  city?: string;
  address?: string;
  description?: string;
  shortDescription?: string;
  coverImage?: string;
  gallery?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  isVedette?: boolean;
  vedetteOrder?: number;
  bannerImage?: string | null;
  startingPrice?: number;
  phone?: string;
  slug?: string;
  immersiveType?: 'none' | 'virtual-tour' | 'view-360';
  immersiveSourceType?: 'url' | 'upload' | null;
  immersiveProvider?: 'custom' | 'matterport' | 'klapty';
  immersiveUrl?: string | null;
  immersiveFile?: string | null;
  immersiveMeta?: Record<string, unknown> | null;
};

export async function updateAdminVenue(id: string, payload: AdminVenuePayload) {
  return apiPatchRaw<{ _id: string }>(`/admin/venues/${id}`, payload);
}

export async function createAdminVenue(payload: AdminVenuePayload & { name: string; type: string; city: string; address: string }) {
  return apiPostRaw<{ _id: string }>('/admin/venues', payload);
}

export async function fetchAdminUsers(params?: { page?: number }) {
  try {
    const qs = params?.page ? `?page=${params.page}` : '';
    const res = await apiGetRaw<{ users?: unknown[] }>(`/admin/users${qs}`);
    const list = (res as { users?: unknown[] })?.users;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function fetchAdminEvents() {
  try {
    const data = await apiGetRaw<unknown[]>(`/admin/events`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export type AdminEventPayload = {
  venueId?: string;
  title?: string;
  type?: string;
  description?: string;
  startAt?: string;
  endsAt?: string;
  coverImage?: string;
  afficheImageUrl?: string;
  isPublished?: boolean;
  isVedette?: boolean;
};

export async function updateAdminEvent(id: string, payload: AdminEventPayload) {
  return apiPatchRaw<{ _id: string }>(`/admin/events/${id}`, payload);
}

export async function createAdminEvent(payload: AdminEventPayload & { venueId: string; title: string; startAt: string }) {
  return apiPostRaw<{ _id: string }>('/admin/events', payload);
}

// Virtual tours (admin)
export async function fetchAdminVirtualTours(venueId: string) {
  try {
    const data = await apiGetRaw<unknown[]>(`/admin/virtual-tours?venueId=${encodeURIComponent(venueId)}`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export type AdminTablePlacement = {
  _id: string;
  venueId: string;
  tableId: string;
  virtualTourId?: string;
  sceneId: string;
  positionType: 'yaw_pitch' | 'matterport_anchor';
  floorIndex?: number;
  yaw?: number;
  pitch?: number;
  anchorPosition?: { x: number; y: number; z: number };
  stemVector?: { x: number; y: number; z: number };
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminTablePlacements(
  venueId: string,
  virtualTourId?: string,
  sceneId?: string
): Promise<AdminTablePlacement[]> {
  try {
    const sp = new URLSearchParams();
    sp.set('venueId', venueId);
    if (virtualTourId) sp.set('virtualTourId', virtualTourId);
    if (sceneId) sp.set('sceneId', sceneId);
    const qs = sp.toString();
    const res = await apiGetRaw<{ success?: boolean; data?: AdminTablePlacement[] } | AdminTablePlacement[]>(
      `/admin/table-placements?${qs}`
    );
    const data =
      Array.isArray(res) ? res : (res as { data?: AdminTablePlacement[] })?.data ?? (res as { placements?: AdminTablePlacement[] })?.placements;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createAdminTablePlacement(payload: {
  venueId: string;
  tableId: string;
  virtualTourId?: string;
  sceneId: string;
  positionType?: 'yaw_pitch' | 'matterport_anchor';
  yaw?: number;
  pitch?: number;
  anchorPosition?: { x: number; y: number; z: number };
  stemVector?: { x: number; y: number; z: number };
  floorIndex?: number;
}) {
  return apiPostRaw<{ success?: boolean; data?: AdminTablePlacement } | AdminTablePlacement>('/admin/table-placements', payload);
}

export async function updateAdminTablePlacement(
  id: string,
  payload: Partial<{
    sceneId: string;
    yaw: number;
    pitch: number;
    tableId: string;
    positionType: 'yaw_pitch' | 'matterport_anchor';
    anchorPosition: { x: number; y: number; z: number };
    stemVector: { x: number; y: number; z: number };
    floorIndex: number;
  }>
) {
  return apiPatchRaw<{ success?: boolean; data?: AdminTablePlacement } | AdminTablePlacement>(
    `/admin/table-placements/${id}`,
    payload
  );
}

export async function deleteAdminTablePlacement(id: string) {
  await api.delete(`/admin/table-placements/${id}`);
}

// Admin tables (per venue)
export type AdminTableRow = {
  _id: string;
  venueId: string;
  tableNumber: number;
  name?: string;
  code?: string;
  capacity: number;
  capacityMax?: number;
  locationLabel: string;
  price: number;
  minimumSpend?: number;
  defaultStatus: 'available' | 'reserved' | 'blocked';
  isVip: boolean;
  isActive: boolean;
};

export async function fetchAdminVenueTables(venueId: string): Promise<AdminTableRow[]> {
  try {
    const res = await apiGetRaw<{ data?: AdminTableRow[] }>(`/admin/venues/${venueId}/tables`);
    const data = (res as { data?: AdminTableRow[] })?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createAdminTable(payload: {
  venueId: string;
  tableNumber: number;
  name?: string;
  code?: string;
  capacity: number;
  capacityMax?: number;
  locationLabel?: string;
  price?: number;
  minimumSpend?: number;
  defaultStatus?: 'available' | 'reserved' | 'blocked';
  isVip?: boolean;
  isActive?: boolean;
}) {
  return apiPostRaw<AdminTableRow>('/admin/tables', payload);
}

export async function updateAdminTable(id: string, payload: Partial<{ tableNumber: number; name: string; code: string; capacity: number; capacityMax: number; locationLabel: string; price: number; minimumSpend: number; defaultStatus: string; isVip: boolean; isActive: boolean }>) {
  return apiPatchRaw<AdminTableRow>(`/admin/tables/${id}`, payload);
}

export async function deleteAdminTable(id: string) {
  await api.delete(`/admin/tables/${id}`);
}

export interface AdminBannerSlide {
  _id: string;
  titleFr: string;
  subtitleFr?: string;
  ctaLabelFr?: string;
  ctaUrl?: string;
  imageUrlDesktop: string;
  imageUrlMobile?: string;
  sortOrder: number;
  isActive: boolean;
}

export async function fetchAdminBannerSlides(): Promise<AdminBannerSlide[]> {
  try {
    const res = await apiGetRaw<{ success?: boolean; data?: AdminBannerSlide[] } | AdminBannerSlide[]>('/admin/banner-slides');
    const list = Array.isArray(res) ? res : (res as { data?: AdminBannerSlide[] })?.data ?? (res as { bannerSlides?: AdminBannerSlide[] })?.bannerSlides;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export type AdminBannerSlidePayload = {
  titleFr?: string;
  subtitleFr?: string;
  imageUrlDesktop?: string;
  imageUrlMobile?: string;
  ctaLabelFr?: string;
  ctaUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function createAdminBannerSlide(payload: AdminBannerSlidePayload & { titleFr: string; imageUrlDesktop: string }) {
  return api.post<{ data?: AdminBannerSlide }>('/admin/banner-slides', payload);
}

export async function updateAdminBannerSlide(id: string, payload: AdminBannerSlidePayload) {
  return apiPatchRaw<AdminBannerSlide>(`/admin/banner-slides/${id}`, payload);
}

export async function deleteAdminBannerSlide(id: string) {
  await api.delete(`/admin/banner-slides/${id}`);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  displayOrder?: number;
  icon?: string;
  description?: string;
}

export type AdminCategoryPayload = {
  name?: string;
  slug?: string;
  type?: string;
  displayOrder?: number;
  icon?: string;
  description?: string;
};

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  try {
    const res = await apiGetRaw<{ success?: boolean; data?: AdminCategory[] } | AdminCategory[]>('/admin/categories');
    const list = Array.isArray(res) ? res : (res as { data?: AdminCategory[] })?.data ?? (res as { categories?: AdminCategory[] })?.categories;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function createAdminCategory(payload: AdminCategoryPayload & { name: string; slug: string }) {
  return apiPostRaw<AdminCategory>('/admin/categories', payload);
}

export async function updateAdminCategory(id: string, payload: AdminCategoryPayload) {
  return apiPatchRaw<AdminCategory>(`/admin/categories/${id}`, payload);
}

export async function deleteAdminCategory(id: string) {
  await api.delete(`/admin/categories/${id}`);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  createdAt?: string;
  phone?: string;
  isActive?: boolean;
}

export async function updateAdminUser(id: string, payload: { role?: string; isActive?: boolean; fullName?: string }) {
  return apiPatchRaw<AdminUser>(`/admin/users/${id}`, payload);
}

export async function deleteAdminUser(id: string) {
  await api.delete(`/admin/users/${id}`);
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface AdminSettings {
  siteName?: string;
  logoUrlLight?: string;
  logoUrlDark?: string;
  supportPhone?: string;
  supportEmail?: string;
  defaultLanguage?: string;
  maintenanceMode?: boolean;
  homeSectionsOrder?: string[];
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  try {
    const res = await apiGetRaw<{ success?: boolean; data?: AdminSettings } | AdminSettings>('/admin/settings');
    const data = (res as { data?: AdminSettings })?.data ?? (res as AdminSettings);
    return (data as AdminSettings) ?? {};
  } catch {
    return {};
  }
}

export async function updateAdminSettings(payload: Partial<AdminSettings>): Promise<AdminSettings> {
  return apiPatchRaw<AdminSettings>('/admin/settings', payload);
}

// ─── Public categories (for explorer filter) ─────────────────────────────────

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  icon?: string;
  displayOrder?: number;
}

export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  try {
    const res = await apiGetRaw<{ success?: boolean; data?: PublicCategory[] } | PublicCategory[]>('/categories');
    const list = Array.isArray(res) ? res : (res as { data?: PublicCategory[] })?.data ?? (res as { categories?: PublicCategory[] })?.categories;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
