import { apiGetRaw, api } from './client';
import type { Review } from './types';

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  avgRating: number | null;
}

export async function fetchVenueReviews(
  venueId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> {
  try {
    const data = await apiGetRaw<ReviewsResponse>(
      `/reviews/venue/${venueId}?page=${page}&limit=${limit}`
    );
    return data ?? { reviews: [], total: 0, page: 1, limit: 10, avgRating: null };
  } catch {
    return { reviews: [], total: 0, page: 1, limit: 10, avgRating: null };
  }
}

export async function createReview(body: {
  venueId: string;
  reservationId?: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const res = await api.post<{ data?: Review } | Review>('/reviews', body);
  const raw = res?.data ?? (res as unknown as Review);
  const data = raw && typeof raw === 'object' && 'data' in raw
    ? (raw as { data: Review }).data
    : raw;
  if (!data) throw new Error('Erreur lors de la création de l\'avis.');
  return data;
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
