'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Music, ArrowRight } from 'lucide-react';
import { CardFooter, CardHeader } from '@/components/ui/card';
import { BaseCard } from '@/components/shared/BaseCard';
import { TypeBadge } from '@/components/shared/TypeBadge';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/api/types';

function getVenueName(ev: Event): string {
  const v = ev.venueId;
  if (typeof v === 'object' && v?.name) return v.name;
  return '';
}

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const href = `/evenement/${event.slug || event._id}`;
  const start = new Date(event.startAt);

  return (
    <Link href={href} className={cn('group block', className)}>
      <BaseCard className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px" />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              <Music className="size-12 opacity-40" />
            </div>
          )}
          <div className="absolute right-2.5 top-2.5 flex flex-wrap gap-1.5">
            <TypeBadge type={event.type} />
            {event.isSponsored && (
              <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                Sponsorisé
              </span>
            )}
          </div>
        </div>

        <CardHeader className="flex-1 space-y-1.5 pb-2">
          <h3 className="line-clamp-1 text-base font-semibold leading-tight tracking-tight">
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {getVenueName(event) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {getVenueName(event)}
              </span>
            )}
          </div>
        </CardHeader>

        <CardFooter className="pt-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
            Voir l&apos;événement
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </BaseCard>
    </Link>
  );
}
