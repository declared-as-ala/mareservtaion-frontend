'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { PublicTablePlacement } from '@/lib/api/venues';
import type { Venue, MenuItem, MenuCategory } from '@/lib/api/types';
import { fetchVenueMenu } from '@/lib/api/menu';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import {
  createReservation,
  createReservationHold,
  fetchTableAvailabilityTimeline,
  releaseReservationHold,
  type TableAvailabilityTimeline,
} from '@/lib/api/reservations';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Users, Crown, Calendar, Clock, Phone, Loader2,
  UtensilsCrossed, CheckCircle2, ArrowLeft, ArrowRight,
  Minus, Plus, ShoppingCart, CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<MenuCategory, string> = {
  entree: 'Entrees', plat: 'Plats', dessert: 'Desserts', boisson: 'Boissons', autre: 'Autres',
};
const CATEGORY_ORDER: MenuCategory[] = ['entree', 'plat', 'dessert', 'boisson', 'autre'];

function todayStr() { return new Date().toISOString().slice(0, 10); }
function buildIso(date: string, time: string): string { return new Date(`${date}T${time}:00`).toISOString(); }
function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const lastName = parts.slice(1).join(' ') || (parts[0] ?? '');
  return { firstName: parts[0] ?? '', lastName };
}

// ─── Types ──────────────────────────────────────────────────────────────────
export type StepReservationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement: PublicTablePlacement;
  venue: Venue;
  imageUrl?: string;
  initialStartAt: string;
  initialEndAt: string;
};

const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} – ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

function TimelineHourLists({
  timeline,
  timelineLoading,
  timelineError,
}: {
  timeline: TableAvailabilityTimeline | undefined;
  timelineLoading: boolean;
  timelineError: boolean;
}) {
  if (timelineError) {
    return <p className="text-xs text-red-300">Impossible de charger les creneaux pour cette date.</p>;
  }
  if (timelineLoading || !timeline?.slots?.length) {
    return <p className="text-xs text-zinc-500">Chargement des creneaux...</p>;
  }

  const free = timeline.slots.filter((s) => s.available);
  const taken = timeline.slots.filter((s) => !s.available);
  const durationMin = timeline.reservationDurationMinutes ?? 120;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-300">
          Libres: {free.length}
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300">
          Indisponibles: {taken.length}
        </div>
      </div>

      {taken.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-zinc-400">
            Creneaux deja pris (arrivee – fin ~{durationMin} min)
          </p>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {taken.map((slot) => (
              <span
                key={`t-${slot.time}`}
                className="rounded-lg border border-red-500/35 bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-200"
              >
                {formatRange(slot.startAt, slot.endAt)}
              </span>
            ))}
          </div>
        </div>
      )}

      {free.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-zinc-400">
            Creneaux libres (choisissez une arrivee ci-dessous)
          </p>
          <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {free.map((slot) => (
              <span
                key={`f-${slot.time}`}
                className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-200"
              >
                {formatRange(slot.startAt, slot.endAt)}
              </span>
            ))}
          </div>
        </div>
      )}

      {!!timeline.reservedRanges?.length && (
        <div className="space-y-1.5 border-t border-zinc-800 pt-2">
          <p className="text-[11px] font-semibold text-zinc-500">Reservations enregistrees</p>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {timeline.reservedRanges.map((range, idx) => (
              <span
                key={`r-${range.startAt}-${idx}`}
                className="rounded-full border border-zinc-600 bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-400"
              >
                {formatRange(range.startAt, range.endAt)}
                {range.source === 'hold' ? ' (maintien)' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className={cn(
            'flex items-center justify-center size-7 rounded-full text-xs font-bold transition-all duration-300',
            i < current ? 'bg-amber-400 text-black' :
            i === current ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' :
            'bg-zinc-800 text-zinc-500'
          )}>
            {i < current ? <CheckCircle2 className="size-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-1 rounded-full transition-all duration-300',
              i < current ? 'bg-amber-400' : 'bg-zinc-800'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function StepReservationModal({
  open, onOpenChange, placement, venue, imageUrl, initialStartAt,
}: StepReservationModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem, openDrawer } = useCartStore();

  const isAvailable = placement.table.status === 'available';
  const tableLabel = placement.table.name || `Table ${placement.table.tableNumber}`;
  const tablePrice = placement.table.price ?? venue.startingPrice ?? 0;
  const minimumSpend = (placement.table as { minimumSpend?: number }).minimumSpend ?? tablePrice;
  const maxCapacity = placement.table.capacity ?? 20;

  const STEPS_COUNT = 4;
  const [step, setStep] = useState(0);

  // ── Form state ───────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => todayStr());
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [guestPhone, setGuestPhone] = useState('');
  const [orderMode, setOrderMode] = useState<'table_only' | 'with_menu'>('table_only');
  const [menuQty, setMenuQty] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [holdTick, setHoldTick] = useState(Date.now());
  const [persistHold, setPersistHold] = useState(false);
  const holdIdRef = useRef<string | null>(null);
  const persistHoldRef = useRef(false);

  // Reset on open — only when modal opens
  useEffect(() => {
    if (!open) return;
    const d = new Date(initialStartAt);
    const s = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : todayStr();
    setSelectedDate(s >= todayStr() ? s : todayStr());
    setSelectedTime('19:00');
    setPartySize(Math.min(2, maxCapacity));
    setGuestPhone('');
    setOrderMode('table_only');
    setMenuQty({});
    setStep(0);
    setLoading(false);
    setHoldId(null);
    setHoldExpiresAt(null);
    setHoldError(null);
    setPersistHold(false);
    holdIdRef.current = null;
    persistHoldRef.current = false;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    holdIdRef.current = holdId;
  }, [holdId]);

  useEffect(() => {
    persistHoldRef.current = persistHold;
  }, [persistHold]);

  const { data: menuData = [] } = useQuery({
    queryKey: ['venue-menu', venue._id],
    queryFn: () => fetchVenueMenu(venue._id),
    enabled: open && orderMode === 'with_menu',
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: timeline,
    isLoading: timelineLoading,
    isError: timelineError,
  } = useQuery({
    queryKey: ['table-availability-timeline', placement.table._id, selectedDate],
    queryFn: () => fetchTableAvailabilityTimeline(placement.table._id, selectedDate),
    enabled: open && !!placement.table?._id,
    staleTime: 20 * 1000,
  });

  useEffect(() => {
    if (!timeline?.slots?.length) return;
    const current = timeline.slots.find((slot) => slot.time === selectedTime);
    if (current?.available) return;
    const firstAvailable = timeline.slots.find((slot) => slot.available);
    if (firstAvailable) setSelectedTime(firstAvailable.time);
  }, [timeline, selectedTime]);

  const startAtIso = buildIso(selectedDate, selectedTime);
  const endAtIso = new Date(new Date(startAtIso).getTime() + 2 * 60 * 60 * 1000).toISOString();
  const holdSecondsLeft = holdExpiresAt
    ? Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - holdTick) / 1000))
    : null;

  useEffect(() => {
    if (!open || !holdExpiresAt) return;
    const timer = window.setInterval(() => setHoldTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open, holdExpiresAt]);

  useEffect(() => {
    if (!open || !user || !placement.table?._id) return;

    let cancelled = false;
    setHoldError(null);

    async function syncHold() {
      try {
        const hold = await createReservationHold({
          venueId: venue._id,
          tableId: placement.table._id,
          startsAt: startAtIso,
          endsAt: endAtIso,
          peopleCount: partySize,
        });
        if (cancelled) {
          void releaseReservationHold(hold._id).catch(() => undefined);
          return;
        }
        if (holdIdRef.current && holdIdRef.current !== hold._id) {
          void releaseReservationHold(holdIdRef.current).catch(() => undefined);
        }
        setHoldId(hold._id);
        setHoldExpiresAt(hold.expiresAt);
        setHoldTick(Date.now());
      } catch (error) {
        if (!cancelled) {
          setHoldId(null);
          setHoldExpiresAt(null);
          setHoldError(error instanceof Error ? error.message : 'Impossible de maintenir cette table.');
        }
      }
    }

    void syncHold();

    return () => {
      cancelled = true;
      if (holdIdRef.current && !persistHoldRef.current) {
        void releaseReservationHold(holdIdRef.current).catch(() => undefined);
      }
    };
  }, [open, user, venue._id, placement.table, startAtIso, endAtIso, partySize]); // eslint-disable-line react-hooks/exhaustive-deps

  const menuTotal = menuData.reduce((acc, item) => acc + (menuQty[item._id] ?? 0) * item.price, 0);
  const selectedMenuItems = menuData
    .filter((item) => (menuQty[item._id] ?? 0) > 0)
    .map((item) => ({ itemId: item._id, name: item.name, quantity: menuQty[item._id], unitPrice: item.price, category: item.category }));
  const menuMeetsMinimum = menuTotal >= minimumSpend || minimumSpend === 0;

  function changeQty(id: string, delta: number) {
    setMenuQty((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  }

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return isAvailable;
      case 1: return partySize >= 1 && partySize <= maxCapacity;
      case 2: return orderMode !== 'with_menu' || menuMeetsMinimum;
      case 3: return true;
      default: return false;
    }
  }, [step, isAvailable, partySize, maxCapacity, orderMode, menuMeetsMinimum]);

  const nextStep = () => { if (canProceed && step < STEPS_COUNT - 1) setStep(s => s + 1); };
  const prevStep = () => { if (step > 0) setStep(s => s - 1); };

  const handleAddToCart = () => {
    setPersistHold(true);
    const base = {
      id: `venue-${venue._id}-table-${placement.table._id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: (venue.type === 'HOTEL' ? 'venue_room' : 'venue_table') as 'venue_room' | 'venue_table',
      title: venue.name,
      imageUrl,
      unitLabel: tableLabel,
      unitType: venue.type,
      dateTime: startAtIso,
      endAt: endAtIso,
      quantity: partySize,
      venueId: venue._id,
      tableId: placement.table._id,
      slug: venue.slug,
      holdId: holdId ?? undefined,
      holdExpiresAt: holdExpiresAt ?? undefined,
    };
    if (orderMode === 'with_menu') {
      addItem({ ...base, price: menuTotal, orderType: 'with_menu', menuItems: selectedMenuItems, menuTotal });
    } else {
      addItem({ ...base, price: tablePrice, orderType: 'table_only' });
    }
    onOpenChange(false);
    openDrawer();
  };

  const handleReserve = async () => {
    if (!isAvailable) return;
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(`/lieu/${venue.slug || venue._id}`)}`);
      return;
    }
    if (user.emailVerified === false) {
      toast.error('Verifiez votre email avant de reserver.', {
        description: "Ouvrez votre lien de verification puis reessayez.",
      });
      router.push('/email-verified?success=false');
      return;
    }
    if (!guestPhone.trim()) { toast.error('Numero de telephone requis.'); return; }
    if (orderMode === 'with_menu' && !menuMeetsMinimum) { toast.error(`Minimum ${minimumSpend} TND requis.`); return; }
    if (holdSecondsLeft !== null && holdSecondsLeft <= 0) { toast.error('Le temps de maintien a expire.'); return; }
    setLoading(true);
    try {
      setPersistHold(true);
      const { firstName, lastName } = splitFullName(user.fullName);
      const result = await createReservation({
        venueId: venue._id, bookingType: 'TABLE', tableId: placement.table._id,
        startAt: startAtIso, endAt: endAtIso, partySize,
        guestFirstName: firstName, guestLastName: lastName,
        guestPhone: guestPhone.trim(), guestEmail: user.email,
      });
      toast.success('Reservation confirmee !');
      onOpenChange(false);
      if (result._id) router.push(`/reservation/${result._id}/confirmation`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Echec de la reservation.');
    } finally { setLoading(false); }
  };

  const renderStep = () => {
    switch (step) {
      // ── STEP 0: Table confirmation ──
      case 0:
        return (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Votre table</h3>
              <p className="text-xs text-zinc-500 mt-1">Verifiez les details avant de continuer</p>
            </div>

            <div className={cn(
              'rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all',
              isAvailable ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-900/60'
            )}>
              <div className={cn(
                'size-14 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0',
                isAvailable ? 'bg-amber-400/15 text-amber-400' : 'bg-zinc-800 text-zinc-500'
              )}>
                {placement.table.tableNumber ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{tableLabel}</h3>
                  {placement.table.isVip && <Crown className="size-3.5 text-amber-400" />}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{venue.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Users className="size-3" />{placement.table.capacity} pers. max</span>
                  {tablePrice > 0 && <span className="font-semibold text-amber-400">{tablePrice} TND min.</span>}
                  {placement.table.locationLabel && <span>{placement.table.locationLabel}</span>}
                </div>
              </div>
              <div className={cn(
                'flex-shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold',
                isAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              )}>
                <span className={cn('size-1.5 rounded-full', isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                {isAvailable ? 'Disponible' : 'Reservee'}
              </div>
            </div>

            {!isAvailable && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500 flex-shrink-0" />
                Cette table n&apos;est pas disponible pour le moment.
              </div>
            )}

            {holdError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                {holdError}
              </div>
            )}

            {holdSecondsLeft !== null && holdSecondsLeft > 0 && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-300">
                Maintien actif: {Math.floor(holdSecondsLeft / 60).toString().padStart(2, '0')}:
                {String(holdSecondsLeft % 60).padStart(2, '0')}
              </div>
            )}

            <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Heures de cette table
                </h4>
                <span className="text-[11px] text-zinc-500">
                  Jour: <span className="font-semibold text-zinc-300">{selectedDate}</span>
                </span>
              </div>
              <TimelineHourLists
                timeline={timeline}
                timelineLoading={timelineLoading}
                timelineError={timelineError}
              />
            </div>
          </div>
        );

      // ── STEP 1: Date & Time ──
      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Date et heure</h3>
              <p className="text-xs text-zinc-500 mt-1">Choisissez votre creneau</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Calendar className="size-3.5" /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={todayStr()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/60 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Clock className="size-3.5" /> Heure d&apos;arrivee
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {(timeline?.slots?.length ? timeline.slots : TIME_SLOTS.map((time) => ({ time, available: true }))).map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  const isAvailableSlot = slot.available;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => isAvailableSlot && setSelectedTime(slot.time)}
                      disabled={!isAvailableSlot}
                      className={cn(
                        'rounded-xl border py-2.5 text-xs font-semibold transition-all duration-150',
                        isSelected && isAvailableSlot && 'border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/20',
                        !isSelected && isAvailableSlot && 'border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-amber-400/50',
                        !isAvailableSlot && 'border-red-500/30 bg-red-500/10 text-red-300/80 line-through cursor-not-allowed'
                      )}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/60 transition-all mt-2"
              />
            </div>

            <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Creneaux sur la date choisie
                </h4>
              </div>
              <TimelineHourLists
                timeline={timeline}
                timelineLoading={timelineLoading}
                timelineError={timelineError}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Users className="size-3.5" /> Nombre de personnes
              </label>
              <div className="flex items-center gap-4 bg-zinc-800/60 rounded-xl border border-zinc-700 p-4">
                <button
                  type="button"
                  onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                  className="size-10 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all"
                >
                  <Minus className="size-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-black text-white tabular-nums">{partySize}</span>
                  <span className="text-xs text-zinc-500 ml-2">/ {maxCapacity}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPartySize((n) => Math.min(maxCapacity, n + 1))}
                  className="size-10 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );

      // ── STEP 2: Info & Menu ──
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Informations</h3>
              <p className="text-xs text-zinc-500 mt-1">Derniers details avant de confirmer</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Phone className="size-3.5" /> Telephone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="ex: 12 345 678"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/60 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Mode de reservation</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderMode('table_only')}
                  className={cn(
                    'rounded-2xl border p-3.5 text-left transition-all duration-150',
                    orderMode === 'table_only'
                      ? 'border-amber-400/60 bg-amber-400/10 shadow-md shadow-amber-400/10'
                      : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-600'
                  )}
                >
                  <div className="text-xl mb-1.5">🪑</div>
                  <div className="text-xs font-bold text-white">Reservation simple</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Commandez sur place</div>
                  {tablePrice > 0 && <div className="text-[10px] font-semibold text-amber-400 mt-1.5">Min. {tablePrice} TND</div>}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('with_menu')}
                  className={cn(
                    'rounded-2xl border p-3.5 text-left transition-all duration-150',
                    orderMode === 'with_menu'
                      ? 'border-amber-400/60 bg-amber-400/10 shadow-md shadow-amber-400/10'
                      : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-600'
                  )}
                >
                  <div className="text-xl mb-1.5">🍽️</div>
                  <div className="text-xs font-bold text-white">Commander le menu</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Choisissez vos plats</div>
                  {menuTotal > 0
                    ? <div className={cn('text-[10px] font-semibold mt-1.5', menuMeetsMinimum ? 'text-emerald-400' : 'text-amber-400')}>Total : {menuTotal.toFixed(2)} TND</div>
                    : minimumSpend > 0 && <div className="text-[10px] font-semibold text-zinc-500 mt-1.5">Min. {minimumSpend} TND</div>}
                </button>
              </div>
            </div>

            {orderMode === 'with_menu' && (
              <div className="space-y-3">
                {minimumSpend > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Total selectionne</span>
                      <span className={cn('font-bold', menuMeetsMinimum ? 'text-emerald-400' : 'text-amber-400')}>
                        {menuTotal.toFixed(2)} / {minimumSpend} TND
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', menuMeetsMinimum ? 'bg-emerald-500' : 'bg-amber-400')}
                        style={{ width: `${Math.min(100, (menuTotal / minimumSpend) * 100)}%` }}
                      />
                    </div>
                    {!menuMeetsMinimum && (
                      <p className="text-[10px] text-amber-400">Encore {(minimumSpend - menuTotal).toFixed(2)} TND pour atteindre le minimum.</p>
                    )}
                  </div>
                )}
                {menuData.length === 0 ? (
                  <div className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/30 py-8 text-sm text-zinc-500 gap-2">
                    <UtensilsCrossed className="size-4" /> Aucun article disponible.
                  </div>
                ) : (
                  CATEGORY_ORDER.filter((cat) => menuData.some((i) => i.category === cat)).map((cat) => (
                    <div key={cat}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{CATEGORY_LABELS[cat]}</p>
                      <div className="space-y-2">
                        {menuData.filter((i) => i.category === cat).map((item: MenuItem) => {
                          const qty = menuQty[item._id] ?? 0;
                          return (
                            <div key={item._id} className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-3 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                                  {item.isPopular && <span className="text-[9px] bg-amber-400/15 text-amber-400 rounded-full px-1.5 py-0.5 font-bold flex-shrink-0">★</span>}
                                </div>
                                {item.description && <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{item.description}</p>}
                                <span className="text-xs font-bold text-amber-400 mt-0.5 block">{item.price.toFixed(2)} TND</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button type="button" onClick={() => changeQty(item._id, -1)} disabled={qty === 0}
                                  className="size-7 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 transition-all">
                                  <Minus className="size-3" />
                                </button>
                                <span className="text-sm font-bold text-white tabular-nums min-w-[16px] text-center">{qty}</span>
                                <button type="button" onClick={() => changeQty(item._id, 1)}
                                  className="size-7 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                                  <Plus className="size-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      // ── STEP 3: Confirmation ──
      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto size-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="size-6 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">Confirmer la reservation</h3>
              <p className="text-xs text-zinc-500 mt-1">Verifiez et confirmez</p>
            </div>

            <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400/10 to-transparent px-4 py-3.5 flex items-center gap-3 border-b border-zinc-700/60">
                <div className="size-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-base font-black text-amber-400">
                  {placement.table.tableNumber}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{tableLabel}</span>
                    {placement.table.isVip && <Crown className="size-3 text-amber-400" />}
                  </div>
                  <p className="text-xs text-zinc-500">{venue.name}</p>
                </div>
              </div>

              <div className="px-4 py-3.5 space-y-2.5">
                {[
                  { icon: Calendar, label: 'Date', value: selectedDate },
                  { icon: Clock, label: 'Heure', value: selectedTime },
                  { icon: Users, label: 'Personnes', value: String(partySize) },
                  { icon: Phone, label: 'Telephone', value: guestPhone || '-' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2"><Icon className="size-3.5" />{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
                {orderMode === 'with_menu' && menuTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2"><UtensilsCrossed className="size-3.5" />Menu</span>
                    <span className="font-semibold text-amber-400">{menuTotal.toFixed(2)} TND</span>
                  </div>
                )}
                {tablePrice > 0 && orderMode === 'table_only' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Minimum</span>
                    <span className="font-semibold text-amber-400">{tablePrice} TND</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── IMPORTANT: Sheet is inlined directly (NOT wrapped in a function component
  // defined inside render) to prevent unmount/remount on every state change ──
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="border-t border-zinc-800 bg-zinc-950 rounded-t-3xl p-0 max-h-[95vh] overflow-y-auto sm:max-h-[90vh]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        <SheetHeader className="px-5 pt-2 pb-0">
          <SheetTitle className="text-white text-base font-semibold">Reserver une table</SheetTitle>
          <SheetDescription className="sr-only">Flow de reservation en etapes</SheetDescription>
        </SheetHeader>

        <div className="px-5 py-4 space-y-5">
          <StepIndicator current={step} total={STEPS_COUNT} />

          {renderStep()}

          <div className="flex gap-3 pt-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-[0.98] transition-all"
              >
                <ArrowLeft className="size-4" /> Retour
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-[0.98] transition-all"
              >
                Fermer
              </button>
            )}

            {step < STEPS_COUNT - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-xl font-bold py-3 text-sm transition-all active:scale-[0.98]',
                  canProceed
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                )}
              >
                Continuer <ArrowRight className="size-4" />
              </button>
            ) : (
              <div className="flex-1 flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 text-amber-400 font-bold py-3 text-sm hover:bg-amber-400/15 active:scale-[0.98] transition-all"
                >
                  <ShoppingCart className="size-4" /> Panier
                </button>
                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={loading || !guestPhone.trim()}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-xl font-bold py-3 text-sm transition-all active:scale-[0.98]',
                    'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20',
                    loading && 'opacity-70',
                    !guestPhone.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                  Confirmer
                </button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
