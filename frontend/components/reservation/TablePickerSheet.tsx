'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { fetchVenueTablePlacements, type PublicTablePlacement } from '@/lib/api/venues';
import type { Venue } from '@/lib/api/types';
import { TableReservationModal } from './TableReservationModal';
import { Users, Calendar, Clock, Crown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function todayStr() { return new Date().toISOString().slice(0, 10); }
function buildIso(date: string, time: string) { return new Date(`${date}T${time}:00`).toISOString(); }

/** Extract HH:MM from an ISO string in local time */
function isoToLocalTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function isoToLocalDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface TablePickerSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  venue: Venue;
  imageUrl?: string;
  /** Pass the same window used by the 360° view so availability matches */
  initialStartAt?: string;
  initialEndAt?: string;
}

export function TablePickerSheet({ open, onOpenChange, venue, imageUrl, initialStartAt, initialEndAt }: TablePickerSheetProps) {
  const [date, setDate]           = useState(() => initialStartAt ? isoToLocalDate(initialStartAt) : todayStr());
  const [startTime, setStartTime] = useState(() => initialStartAt ? isoToLocalTime(initialStartAt) : isoToLocalTime(new Date(Date.now() + 60 * 60 * 1000).toISOString()));
  const [endTime, setEndTime]     = useState(() => initialEndAt   ? isoToLocalTime(initialEndAt)   : isoToLocalTime(new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()));
  const [filter, setFilter]       = useState<'all' | 'available'>('available');
  const [selected, setSelected]   = useState<PublicTablePlacement | null>(null);

  const startAtIso = buildIso(date, startTime);
  const endAtIso   = buildIso(date, endTime);

  const { data: placements = [], isFetching } = useQuery({
    queryKey: ['venue-placements-picker', venue._id, startAtIso, endAtIso],
    queryFn: () => fetchVenueTablePlacements(venue._id, { startAt: startAtIso, endAt: endAtIso }),
    enabled: open,
    staleTime: 30_000,
  });

  const shown = useMemo(() =>
    filter === 'available' ? placements.filter((p) => p.table.status === 'available') : placements,
    [placements, filter]
  );

  const availableCount = placements.filter((p) => p.table.status === 'available').length;

  return (
    <>
      <Sheet open={open && !selected} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-0 max-h-[92vh] overflow-y-auto">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-700" />
          </div>

          <SheetHeader className="px-5 pt-2 pb-0">
            <SheetTitle className="text-zinc-100 text-base font-semibold flex items-center gap-2">
              Choisir une table
              <span className="text-xs font-normal text-zinc-500">— {venue.name}</span>
            </SheetTitle>
          </SheetHeader>

          <div className="px-5 py-4 space-y-5 pb-8">

            {/* ── Date + time ── */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                <Calendar className="size-3.5" /> Date &amp; Horaire
              </label>
              <input
                type="date"
                value={date}
                min={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/60 transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <Clock className="size-3" /> Arrivée
                  </label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/60 transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <Clock className="size-3" /> Départ
                  </label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/60 transition-colors" />
                </div>
              </div>
            </div>

            {/* ── Status bar + filter ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {isFetching ? (
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Loader2 className="size-3.5 animate-spin" /> Vérification...
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="size-3.5" /> {availableCount} disponible{availableCount !== 1 ? 's' : ''}
                    </span>
                    {placements.length - availableCount > 0 && (
                      <span className="flex items-center gap-1.5 text-red-400">
                        <XCircle className="size-3.5" /> {placements.length - availableCount} réservée{placements.length - availableCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex rounded-xl border border-zinc-800 overflow-hidden text-xs">
                {(['available', 'all'] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFilter(f)}
                    className={cn('px-3 py-1.5 font-semibold transition-colors', filter === f ? 'bg-amber-400 text-black' : 'text-zinc-500 hover:text-zinc-300')}>
                    {f === 'available' ? 'Disponibles' : 'Toutes'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Table grid ── */}
            {shown.length === 0 && !isFetching ? (
              <div className="rounded-2xl border border-zinc-800 py-12 flex flex-col items-center gap-3 text-center">
                <XCircle className="size-8 text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-400">Aucune table disponible</p>
                <p className="text-xs text-zinc-600 max-w-xs">
                  Essayez un autre créneau ou désactivez le filtre.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shown.map((p) => {
                  const isAvail = p.table.status === 'available';
                  const price = p.table.price ?? venue.startingPrice ?? 0;
                  return (
                    <button
                      key={p._id}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => { setSelected(p); }}
                      className={cn(
                        'group relative rounded-2xl border p-4 text-left transition-all duration-200',
                        isAvail
                          ? 'border-zinc-700 bg-zinc-900 hover:border-amber-400/50 hover:bg-zinc-800/80 hover:shadow-lg hover:shadow-amber-400/5 active:scale-[0.97] cursor-pointer'
                          : 'border-zinc-800/50 bg-zinc-950 opacity-50 cursor-not-allowed'
                      )}
                    >
                      {/* Status dot */}
                      <div className={cn(
                        'absolute top-3 right-3 size-2 rounded-full',
                        isAvail ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                      )} />

                      {/* Table number */}
                      <div className={cn(
                        'size-10 rounded-xl flex items-center justify-center text-base font-black mb-3',
                        isAvail ? 'bg-amber-400/15 text-amber-400 group-hover:bg-amber-400/25' : 'bg-zinc-800 text-zinc-600'
                      )}>
                        {p.table.tableNumber ?? '?'}
                      </div>

                      <div className="text-xs font-bold text-zinc-200 leading-tight truncate pr-4">
                        {p.table.name || `Table ${p.table.tableNumber}`}
                        {p.table.isVip && <Crown className="size-3 text-amber-400 inline ml-1 -translate-y-px" />}
                      </div>

                      <div className="mt-1.5 flex flex-col gap-0.5">
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <Users className="size-2.5" /> {p.table.capacity} pers. max
                        </span>
                        {price > 0 && (
                          <span className="text-[10px] font-semibold text-amber-400">{price} TND min.</span>
                        )}
                      </div>

                      {isAvail && (
                        <div className="mt-3 text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Sélectionner →
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-zinc-600 pt-1">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> Disponible</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> Réservée</span>
              <span className="flex items-center gap-1.5"><Crown className="size-2.5 text-amber-400" /> VIP</span>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* Opens reservation modal for the selected table */}
      {selected && (
        <TableReservationModal
          open={!!selected}
          onOpenChange={(v) => { if (!v) setSelected(null); }}
          placement={selected}
          venue={venue}
          imageUrl={imageUrl}
          initialStartAt={startAtIso}
          initialEndAt={endAtIso}
        />
      )}
    </>
  );
}
