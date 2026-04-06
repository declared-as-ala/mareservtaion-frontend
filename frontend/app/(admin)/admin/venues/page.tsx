'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminVenues } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  MapPin, Plus, Search, Building2, Star, Eye,
  LayoutGrid, Filter,
} from 'lucide-react';
import { VENUE_TYPE_LABELS } from '@/app/constants/venueTypes';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  ...Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const TYPE_COLORS: Record<string, string> = {
  CAFE:       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  RESTAURANT: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  HOTEL:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  CINEMA:     'bg-violet-500/15 text-violet-400 border-violet-500/30',
  EVENT:      'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

type VenueRow = {
  _id: string; name: string; type: string; city: string;
  coverImage?: string; isPublished?: boolean; isFeatured?: boolean; isSponsored?: boolean;
};

export default function AdminVenuesPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [q, setQ] = useState('');

  const { data: venuesData = [], isLoading } = useQuery({
    queryKey: ['admin', 'venues', typeFilter, q],
    queryFn: () => fetchAdminVenues({ type: typeFilter || undefined, q: q || undefined }),
  });
  const venues = venuesData as VenueRow[];

  const publishedCount = venues.filter((v) => v.isPublished !== false).length;
  const featuredCount  = venues.filter((v) => v.isFeatured).length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lieux</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez vos établissements</p>
        </div>
        <Button asChild className="gap-1.5 rounded-xl shadow-md shadow-primary/20">
          <Link href="/admin/venues/new">
            <Plus className="size-4" /> Nouveau lieu
          </Link>
        </Button>
      </div>

      {/* ── Stats bar ── */}
      {!isLoading && venues.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LayoutGrid className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{venues.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total lieux</p>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Eye className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-emerald-400">{publishedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Publiés</p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Star className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-amber-400">{featuredCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">En vedette</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher par nom, ville…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
        </div>
        <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(q || typeFilter) && (
          <Button variant="ghost" size="sm" className="rounded-xl text-xs"
            onClick={() => { setQ(''); setTypeFilter(''); }}>
            Effacer
          </Button>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted/60" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded-lg w-2/3" />
                <div className="h-3 bg-muted rounded-lg w-1/3" />
                <div className="h-8 bg-muted rounded-xl w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-muted p-12">
          <EmptyState
            icon={<MapPin className="size-12" />}
            title="Aucun lieu"
            description="Les lieux créés apparaîtront ici."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((v) => {
            const typeColor = TYPE_COLORS[v.type] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
            const isPublished = v.isPublished !== false;

            return (
              <div
                key={v._id}
                className="group rounded-2xl border border-border/40 bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
              >
                {/* Cover */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {v.coverImage ? (
                    <Image
                      src={v.coverImage}
                      alt={v.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Building2 className="size-12 text-muted-foreground/25" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Badges top-left */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm',
                      typeColor
                    )}>
                      {VENUE_TYPE_LABELS[v.type] ?? v.type}
                    </span>
                    {v.isFeatured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/80 border-amber-400/50 text-black backdrop-blur-sm">
                        ★ Vedette
                      </span>
                    )}
                    {v.isSponsored && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-500/80 border-violet-400/50 text-white backdrop-blur-sm">
                        Sponsorisé
                      </span>
                    )}
                  </div>

                  {/* Published badge top-right */}
                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm border',
                      isPublished
                        ? 'bg-emerald-500/80 border-emerald-400/50 text-white'
                        : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-400'
                    )}>
                      {isPublished ? '● Publié' : '○ Brouillon'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex items-center justify-between gap-3 flex-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate leading-tight">{v.name}</h3>
                    {v.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="size-3 shrink-0" />
                        {v.city}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline" size="sm" asChild
                    className="rounded-xl shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    <Link href={`/admin/venues/${v._id}`}>Modifier</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
