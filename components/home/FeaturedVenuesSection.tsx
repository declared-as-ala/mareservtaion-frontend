'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchVenues } from '@/lib/api/venues';
import { Star, ArrowRight, MapPin, Video } from 'lucide-react';
import { TypeBadge } from '@/components/shared/TypeBadge';

function VenueSlide({ venue }: {
  venue: {
    _id: string;
    name: string;
    slug?: string;
    city?: string;
    type: string;
    coverImage?: string;
    startingPrice?: number;
    rating?: number;
    hasVirtualTour?: boolean;
    isSponsored?: boolean;
    shortDescription?: string;
    media?: { kind: string; url: string }[];
  }
}) {
  const href = `/lieu/${venue.slug || venue._id}`;
  const img = venue.coverImage ?? venue.media?.find((m) => m.kind === 'HERO_IMAGE')?.url ?? null;

  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-zinc-800">
        {img ? (
          <Image src={img} alt={venue.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="320px" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <MapPin className="size-10 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1.5">
          <TypeBadge type={venue.type as Parameters<typeof TypeBadge>[0]['type']} />
          {venue.isSponsored && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Star className="size-2.5 fill-white" /> Sponsorisé
            </span>
          )}
          {venue.hasVirtualTour && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <Video className="size-2.5" /> 360°
            </span>
          )}
        </div>
        {/* Rating */}
        {venue.rating != null && venue.rating > 0 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-white">{venue.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="size-3 text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">{venue.city}</span>
        </div>
        {venue.shortDescription && (
          <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
            {venue.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          {venue.startingPrice ? (
            <span className="text-xs text-zinc-400">
              À partir de <span className="text-amber-400 font-semibold">{venue.startingPrice} TND</span>
            </span>
          ) : <span />}
          <span className="text-xs font-medium text-amber-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Réserver <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedVenuesSection() {
  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => fetchVenues({ isFeatured: true }),
    staleTime: 2 * 60 * 1000,
  });

  // Don't render section if no featured venues
  if (!isLoading && venues.length === 0) return null;

  return (
    <section className="bg-black py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Star className="size-3.5 fill-black text-black" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Lieux vedettes
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Nos établissements sélectionnés
            </h2>
            <p className="text-sm text-zinc-400 mt-1.5">
              Une sélection soignée des meilleurs lieux partenaires
            </p>
          </div>
          <Link
            href="/explorer?isFeatured=true"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            Voir tous <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Cards carousel */}
        {isLoading ? (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
              >
                <div className="h-44 bg-zinc-800 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-zinc-800 rounded w-full mt-2" />
                  <div className="h-3 bg-zinc-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-none -mx-2 px-2">
            {venues.map((venue) => (
              <VenueSlide key={venue._id} venue={venue} />
            ))}
          </div>
        )}

        {/* Mobile "see all" */}
        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/explorer?isFeatured=true"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Voir tous les lieux vedettes <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
