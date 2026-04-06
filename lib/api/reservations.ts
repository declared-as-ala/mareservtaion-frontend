import { api, apiGetRaw } from './client';
import type { Reservation } from './types';

export async function fetchMyReservations(): Promise<Reservation[]> {
  try {
    const data = await apiGetRaw<Reservation[]>('/reservations/me');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchReservationById(id: string): Promise<Reservation | null> {
  try {
    const raw = await apiGetRaw<{ success?: boolean; data?: Reservation } | Reservation>(`/reservations/me/${id}`);
    // Backend wraps response in { success, data } — unwrap it
    const data = (raw as { data?: Reservation })?.data ?? (raw as Reservation);
    return data && typeof data === 'object' && '_id' in data ? data : null;
  } catch {
    return null;
  }
}

export async function createReservation(body: {
  venueId: string;
  reservableUnitId?: string;
  tableId?: string;
  roomId?: string;
  seatId?: string;
  startAt: string;
  endAt: string;
  partySize?: number;
  bookingType: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
  guestEmail?: string;
}): Promise<{ _id: string; confirmationCode?: string }> {
  const res = await api.post<{ data?: { _id: string; confirmationCode?: string }; _id?: string; confirmationCode?: string }>(
    '/reservations',
    body
  );
  const raw = res?.data ?? (res as unknown as { _id: string; confirmationCode?: string });
  const data = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data: { _id: string; confirmationCode?: string } }).data : raw;
  if (data && data._id) return { _id: data._id, confirmationCode: data.confirmationCode };
  throw new Error('Création de réservation échouée');
}

export async function cancelReservation(id: string): Promise<void> {
  await api.patch(`/reservations/me/${id}/cancel`, {});
}
