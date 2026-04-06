'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchVenues } from '@/lib/api/venues';
import { Star, ArrowRight, MapPin } from 'lucide-react';

export function SponsoredVenuesSection() {
  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues', 'sponsored'],
    queryFn: () => fetchVenues({ isSponsored: true }),
    staleTime: 2 * 60 * 1000,
  });

  if (!isLoading && venues.length === 0) return null;

  return (
    <section className="bg-zinc-950 py-12 border-t border-zinc-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-800 rounded-full px-2.5 py-0.5">
            Partenaires
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {venues.slice(0, 8).map((venue) => {
              const img = venue.coverImage ?? venue.media?.find((m) => m.kind === 'HERO_IMAGE')?.url ?? null;
              return (
                <Link
                  key={venue._id}
                  href={`/lieu/${venue.slug || venue._id}`}
                  className="group relative flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-amber-400/30 hover:bg-zinc-800/60 transition-all"
                >
                  <div className="size-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative">
                    {img ? (
                      <Image src={img} alt={venue.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="size-full flex items-center justify-center">
                        <MapPin className="size-4 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {venue.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{venue.city}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Star className="size-2.5 fill-violet-500 text-violet-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {venues.length > 8 && (
          <div className="mt-4 text-center">
            <Link
              href="/explorer?isSponsored=true"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Voir tous les partenaires <ArrowRight className="size-3" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
