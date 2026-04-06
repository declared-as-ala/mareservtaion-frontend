'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchVenues } from '@/lib/api/venues';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import type { VenueType } from '@/lib/api/types';

interface SimilarVenuesProps {
  venueId: string;
  type: VenueType;
  city: string;
}

export function SimilarVenues({ venueId, type, city }: SimilarVenuesProps) {
  const { data: venues = [] } = useQuery({
    queryKey: ['venues', 'similar', type, city],
    queryFn: () => fetchVenues({ type, city }),
    staleTime: 5 * 60 * 1000,
  });

  const similar = venues.filter((v) => v._id !== venueId).slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <section className="space-y-4 pt-6 border-t">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Lieux similaires à {city}</h3>
        <Link
          href={`/explorer?type=${type}&city=${encodeURIComponent(city)}`}
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          Voir tous <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {similar.map((venue) => {
          const img =
            venue.coverImage ??
            venue.media?.find((m) => m.kind === 'HERO_IMAGE')?.url ??
            null;
          return (
            <Link
              key={venue._id}
              href={`/lieu/${venue.slug || venue._id}`}
              className="group rounded-xl overflow-hidden border bg-card hover:border-primary/50 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-32 bg-muted overflow-hidden">
                {img ? (
                  <Image src={img} alt={venue.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground/20 select-none">
                    {venue.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {venue.name}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" />
                    {venue.city}
                  </span>
                  {venue.rating > 0 && (
                    <span className="text-xs flex items-center gap-0.5 text-amber-500">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {venue.rating}
                    </span>
                  )}
                </div>
                {venue.startingPrice != null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    À partir de <span className="text-amber-500 font-medium">{venue.startingPrice} TND</span>
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
