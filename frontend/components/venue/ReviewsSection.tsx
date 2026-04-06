'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, BadgeCheck, ChevronDown } from 'lucide-react';
import { fetchVenueReviews } from '@/lib/api/reviews';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/api/types';

/* ------------------------------------------------------------------ */
/* Star display                                                          */
/* ------------------------------------------------------------------ */
function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'size-4' : 'size-3';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700')}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rating bar breakdown                                                  */
/* ------------------------------------------------------------------ */
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-400 w-3 shrink-0">{star}</span>
      <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-zinc-500 w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single review card                                                    */
/* ------------------------------------------------------------------ */
function ReviewCard({ review }: { review: Review }) {
  const author =
    typeof review.userId === 'object' && review.userId?.fullName
      ? review.userId.fullName
      : 'Utilisateur';
  const initial = author[0]?.toUpperCase() ?? 'U';
  const date = new Date(review.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="size-9 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-zinc-100 text-sm">{author}</span>
            {review.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-1.5 py-0.5">
                <BadgeCheck className="size-2.5" />
                Vérifié
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars value={review.rating} />
            <span className="text-zinc-600 text-xs">{date}</span>
          </div>
        </div>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                          */
/* ------------------------------------------------------------------ */
interface ReviewsSectionProps {
  venueId: string;
  className?: string;
}

export function ReviewsSection({ venueId, className }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['venue-reviews', venueId, page],
    queryFn: () => fetchVenueReviews(venueId, page, LIMIT),
    enabled: !!venueId,
  });

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? 0;
  const avgRating = data?.avgRating ?? null;
  const hasMore = page * LIMIT < total;

  // Compute distribution from all loaded reviews (approximate)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1; });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-amber-400" />
        <h2 className="font-semibold text-zinc-100 text-lg">
          Avis clients
          {total > 0 && (
            <span className="ml-2 text-zinc-500 font-normal text-sm">({total})</span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="size-9 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-1/4" />
                  <div className="h-2 bg-zinc-800 rounded w-1/3" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 bg-zinc-800 rounded w-full" />
                <div className="h-2.5 bg-zinc-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-zinc-800">
          <Star className="size-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Aucun avis pour ce lieu.</p>
          <p className="text-zinc-600 text-xs mt-1">Soyez le premier à laisser un avis après votre visite.</p>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col sm:flex-row gap-5">
            {/* Big score */}
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-zinc-800 sm:pr-5 shrink-0">
              <span className="text-5xl font-bold text-amber-400">{avgRating?.toFixed(1) ?? '—'}</span>
              <Stars value={avgRating ?? 0} size="md" />
              <span className="text-zinc-500 text-xs mt-1">{total} avis</span>
            </div>
            {/* Distribution bars */}
            <div className="flex-1 space-y-1.5 justify-center flex flex-col">
              {[5, 4, 3, 2, 1].map((s) => (
                <RatingBar key={s} star={s} count={distribution[s] ?? 0} total={reviews.length} />
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <Button
              variant="ghost"
              className="w-full text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:bg-zinc-800/60 gap-2"
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronDown className="size-4" />
              Charger plus d&apos;avis
            </Button>
          )}
        </>
      )}
    </div>
  );
}
