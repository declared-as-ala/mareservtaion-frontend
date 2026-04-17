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
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-md transition-all duration-300 hover:border-amber-400/30 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">

        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.04]">
          {img ? (
            <Image
              src={img}
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-white/[0.04]">
              <MapPin className="size-10 text-neutral-600" />
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
            {venue.isVedette && (
              <span className="inline-flex items-center rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold text-black backdrop-blur-sm">
                ⭐ Vedette
              </span>
            )}
          </div>

          {/* Top-right: 360 badge */}
          {venue.hasVirtualTour && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
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
            <h3 className="line-clamp-1 text-sm font-semibold text-neutral-100 leading-tight">
              {venue.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="size-3 shrink-0" />
            <span className="line-clamp-1">{venue.city}</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 group-hover:bg-amber-400/10 group-hover:border-amber-400/20 border border-white/[0.06] transition-all">
            <span className="text-xs font-semibold text-neutral-400 group-hover:text-amber-300 transition-colors">
              Voir &amp; Réserver
            </span>
            <ArrowUpRight className="size-3.5 text-neutral-600 group-hover:text-amber-300 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
