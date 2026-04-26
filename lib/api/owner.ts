import { apiGetRaw } from './client';
import type { Reservation, Venue } from './types';

export type OwnerDashboardResponse = {
  venues: Venue[];
  stats: {
    totalVenues: number;
    totalReservations: number;
    upcomingReservations: number;
    confirmedReservations: number;
  };
  recentReservations: Reservation[];
};

export async function fetchOwnerDashboard(): Promise<OwnerDashboardResponse | null> {
  try {
    return await apiGetRaw<OwnerDashboardResponse>('/owner/dashboard');
  } catch {
    return null;
  }
}
