'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Video, Star, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/lib/api/types';
import { TypeBadge } from '@/components/shared/TypeBadge';
import { FavoriteButton } from '@/components/shared/FavoriteButton';

function getVenueImage(venue: Venue): string | null {
  if (venue.coverImage) return venue.coverImage;
  const hero = venue.media?.find((m) => m.kind === 'HERO_IMAGE');
  return hero?.url ?? null;
}

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const href = `/lieu/${venue.slug || venue._id}`;
  const img = getVenueImage(venue);

  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">

        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
          {img ? (
            <Image
              src={img}
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-800">
              <MapPin className="size-10 text-zinc-600" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {venue.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-black shadow-lg shadow-amber-500/30">
                <Star className="size-2.5 fill-black" />
                Vedette
              </span>
            )}
            {venue.isSponsored && (
              <span className="inline-flex items-center rounded-full bg-violet-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                Sponsorisé
              </span>
            )}
          </div>

          {/* Top-right: 360 badge */}
          {venue.hasVirtualTour && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                <Video className="size-3" />
                360°
              </span>
            </div>
          )}

          {/* Bottom-left: favorite */}
          <div className="absolute bottom-3 left-3">
            <FavoriteButton venueId={venue._id} size="sm" />
          </div>

          {/* Bottom-right: type */}
          <div className="absolute bottom-3 right-3">
            <TypeBadge type={venue.type} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100 leading-tight">
              {venue.name}
            </h3>
            {venue.rating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">{venue.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="size-3 shrink-0" />
            <span className="line-clamp-1">{venue.city}</span>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 px-3 py-2.5 group-hover:bg-amber-400/10 group-hover:border-amber-400/20 border border-transparent transition-all">
            <span className="text-xs font-semibold text-zinc-400 group-hover:text-amber-400 transition-colors">
              Voir &amp; Réserver
            </span>
            <ArrowUpRight className="size-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
