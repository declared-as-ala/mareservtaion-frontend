'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { PublicTablePlacement } from '@/lib/api/venues';
import type { Venue, MenuItem, MenuCategory } from '@/lib/api/types';
import { fetchVenueMenu } from '@/lib/api/menu';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { createReservation } from '@/lib/api/reservations';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Users, Crown, Calendar, Clock, Phone, Loader2,
  UtensilsCrossed, CheckCircle2, ArrowLeft, ArrowRight,
  Minus, Plus, ShoppingCart, CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<MenuCategory, string> = {
  entree: 'Entr\xe9es', plat: 'Plats', dessert: 'Desserts', boisson: 'Boissons', autre: 'Autres',
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

// Time slot presets for quick selection
const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

// ─── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Table', 'Date & Heure', 'Infos', 'Confirmation'];
  return (
    <div className="flex items-center gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className={cn(
            'flex items-center justify-center size-7 rounded-full text-xs font-bold transition-all duration-300',
            i < current ? 'bg-[#D4AF37] text-white' :
            i === current ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30' :
            'bg-gray-100 text-gray-400'
          )}>
            {i < current ? <CheckCircle2 className="size-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-1 rounded-full transition-all duration-300',
              i < current ? 'bg-[#D4AF37]' : 'bg-gray-100'
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

  // ── Steps ────────────────────────────────────────────────────────────────
  const STEPS_COUNT = 4;
  const [step, setStep] = useState(0);

  // ── Form state ───────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [guestPhone, setGuestPhone] = useState('');
  const [orderMode, setOrderMode] = useState<'table_only' | 'with_menu'>('table_only');
  const [menuQty, setMenuQty] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    const d = new Date(initialStartAt);
    const s = d.toISOString().slice(0, 10);
    setSelectedDate(s >= todayStr() ? s : todayStr());
    setSelectedTime('19:00');
    setPartySize(Math.min(2, maxCapacity));
    setGuestPhone('');
    setOrderMode('table_only');
    setMenuQty({});
    setStep(0);
    setLoading(false);
  }, [open, initialStartAt, maxCapacity]);

  // Fetch menu
  const { data: menuData = [] } = useQuery({
    queryKey: ['venue-menu', venue._id],
    queryFn: () => fetchVenueMenu(venue._id),
    enabled: open && orderMode === 'with_menu',
    staleTime: 5 * 60 * 1000,
  });

  const startAtIso = buildIso(selectedDate, selectedTime);
  // Default 2h duration for backend compatibility
  const endAtIso = new Date(new Date(startAtIso).getTime() + 2 * 60 * 60 * 1000).toISOString();

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

  // ── Navigation ───────────────────────────────────────────────────────────
  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return isAvailable; // table already selected
      case 1: return partySize >= 1 && partySize <= maxCapacity;
      case 2: return orderMode !== 'with_menu' || menuMeetsMinimum;
      case 3: return true;
      default: return false;
    }
  }, [step, isAvailable, partySize, maxCapacity, orderMode, menuMeetsMinimum]);

  const nextStep = () => { if (canProceed && step < STEPS_COUNT - 1) setStep(s => s + 1); };
  const prevStep = () => { if (step > 0) setStep(s => s - 1); };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
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
    if (!guestPhone.trim()) { toast.error('Num\xe9ro de t\xe9l\xe9phone requis.'); return; }
    if (orderMode === 'with_menu' && !menuMeetsMinimum) { toast.error(`Minimum ${minimumSpend} TND requis.`); return; }
    setLoading(true);
    try {
      const { firstName, lastName } = splitFullName(user.fullName);
      const result = await createReservation({
        venueId: venue._id, bookingType: 'TABLE', tableId: placement.table._id,
        startAt: startAtIso, endAt: endAtIso, partySize,
        guestFirstName: firstName, guestLastName: lastName,
        guestPhone: guestPhone.trim(), guestEmail: user.email,
      });
      toast.success('R\xe9servation confirm\xe9e !');
      onOpenChange(false);
      if (result._id) router.push(`/reservation/${result._id}/confirmation`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '\xc9chec de la r\xe9servation.');
    } finally { setLoading(false); }
  };

  // ── Content per step ─────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── STEP 0: Table confirmation ──
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#111111]">Votre table</h3>
              <p className="text-sm text-gray-500 mt-1">V\xe9rifiez les d\xe9tails avant de continuer</p>
            </div>

            <div className={cn(
              'rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all',
              isAvailable ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white' : 'border-gray-200 bg-gray-50'
            )}>
              <div className={cn(
                'size-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0',
                isAvailable ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-gray-200 text-gray-400'
              )}>
                {placement.table.tableNumber ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#111111]">{tableLabel}</h3>
                  {placement.table.isVip && <Crown className="size-4 text-[#D4AF37]" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{venue.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="size-3.5" />{placement.table.capacity} pers. max</span>
                  {tablePrice > 0 && <span className="font-semibold text-[#D4AF37]">{tablePrice} TND min.</span>}
                  {placement.table.locationLabel && <span>{placement.table.locationLabel}</span>}
                </div>
              </div>
              <div className={cn(
                'flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold',
                isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              )}>
                <span className={cn('size-2 rounded-full', isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                {isAvailable ? 'Disponible' : 'R\xe9serv\xe9e'}
              </div>
            </div>

            {!isAvailable && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500 flex-shrink-0" />
                Cette table n&apos;est pas disponible pour le moment.
              </div>
            )}
          </div>
        );

      // ── STEP 1: Date & Time ──
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#111111]">Date & Heure</h3>
              <p className="text-sm text-gray-500 mt-1">Choisissez quand vous venez</p>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Calendar className="size-4" /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={todayStr()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Clock className="size-4" /> Heure d&apos;arriv\xe9e
              </label>
              {/* Quick time slots */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      'rounded-xl border py-2.5 text-xs font-semibold transition-all duration-150',
                      selectedTime === t
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Custom time input */}
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all mt-2"
              />
            </div>

            {/* Party size */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Users className="size-4" /> Nombre de personnes
              </label>
              <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                <button
                  type="button"
                  onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                  className="size-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <Minus className="size-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-black text-[#111111] tabular-nums">{partySize}</span>
                  <span className="text-xs text-gray-400 ml-2">/ {maxCapacity}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPartySize((n) => Math.min(maxCapacity, n + 1))}
                  className="size-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#111111]">Informations</h3>
              <p className="text-sm text-gray-500 mt-1">Derni\xe8res d\xe9tails avant de confirmer</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Phone className="size-4" /> T\xe9l\xe9phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="ex: 12 345 678"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
              />
            </div>

            {/* Mode selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600">Mode de r\xe9servation</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderMode('table_only')}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all duration-150',
                    orderMode === 'table_only'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md shadow-[#D4AF37]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-2">🪑</div>
                  <div className="text-xs font-bold text-[#111111]">Reservation simple</div>
                  <div className="text-[10px] text-gray-500 mt-1">Commandez sur place</div>
                  {tablePrice > 0 && <div className="text-[10px] font-semibold text-[#D4AF37] mt-2">Min. {tablePrice} TND</div>}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('with_menu')}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all duration-150',
                    orderMode === 'with_menu'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md shadow-[#D4AF37]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-2">🍽️</div>
                  <div className="text-xs font-bold text-[#111111]">Commander le menu</div>
                  <div className="text-[10px] text-gray-500 mt-1">Choisissez vos plats</div>
                  {menuTotal > 0
                    ? <div className={cn('text-[10px] font-semibold mt-2', menuMeetsMinimum ? 'text-emerald-600' : 'text-[#D4AF37]')}>Total : {menuTotal.toFixed(2)} TND</div>
                    : minimumSpend > 0 && <div className="text-[10px] font-semibold text-gray-500 mt-2">Min. {minimumSpend} TND</div>}
                </button>
              </div>
            </div>

            {/* Menu items */}
            {orderMode === 'with_menu' && (
              <div className="space-y-3">
                {minimumSpend > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total s\xe9lectionn\xe9</span>
                      <span className={cn('font-bold', menuMeetsMinimum ? 'text-emerald-600' : 'text-[#D4AF37]')}>
                        {menuTotal.toFixed(2)} / {minimumSpend} TND
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', menuMeetsMinimum ? 'bg-emerald-500' : 'bg-[#D4AF37]')}
                        style={{ width: `${Math.min(100, (menuTotal / minimumSpend) * 100)}%` }}
                      />
                    </div>
                    {!menuMeetsMinimum && (
                      <p className="text-[10px] text-[#D4AF37]">Encore {(minimumSpend - menuTotal).toFixed(2)} TND pour atteindre le minimum.</p>
                    )}
                  </div>
                )}
                {menuData.length === 0 ? (
                  <div className="flex items-center justify-center rounded-xl border border-gray-200 py-8 text-sm text-gray-500 gap-2">
                    <UtensilsCrossed className="size-4" /> Aucun article disponible.
                  </div>
                ) : (
                  CATEGORY_ORDER.filter((cat) => menuData.some((i) => i.category === cat)).map((cat) => (
                    <div key={cat}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{CATEGORY_LABELS[cat]}</p>
                      <div className="space-y-2">
                        {menuData.filter((i) => i.category === cat).map((item: MenuItem) => {
                          const qty = menuQty[item._id] ?? 0;
                          return (
                            <div key={item._id} className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold text-[#111111] truncate">{item.name}</span>
                                  {item.isPopular && <span className="text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] rounded-full px-1.5 py-0.5 font-bold flex-shrink-0">★</span>}
                                </div>
                                {item.description && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.description}</p>}
                                <span className="text-xs font-bold text-[#D4AF37] mt-0.5 block">{item.price.toFixed(2)} TND</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button type="button" onClick={() => changeQty(item._id, -1)} disabled={qty === 0}
                                  className="size-7 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-all">
                                  <Minus className="size-3" />
                                </button>
                                <span className="text-sm font-bold text-[#111111] tabular-nums min-w-[16px] text-center">{qty}</span>
                                <button type="button" onClick={() => changeQty(item._id, 1)}
                                  className="size-7 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all">
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
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto size-14 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-3">
                <CheckCircle2 className="size-7 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Confirmer la r\xe9servation</h3>
              <p className="text-sm text-gray-500 mt-1">V\xe9rifiez et confirmez</p>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {/* Table info header */}
              <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 px-5 py-4 flex items-center gap-3">
                <div className="size-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center text-lg font-black text-[#D4AF37]">
                  {placement.table.tableNumber}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111111] text-sm">{tableLabel}</span>
                    {placement.table.isVip && <Crown className="size-3.5 text-[#D4AF37]" />}
                  </div>
                  <p className="text-xs text-gray-500">{venue.name}</p>
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar className="size-4" /> Date</span>
                  <span className="font-semibold text-[#111111]">{selectedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Clock className="size-4" /> Heure</span>
                  <span className="font-semibold text-[#111111]">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Users className="size-4" /> Personnes</span>
                  <span className="font-semibold text-[#111111]">{partySize}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Phone className="size-4" /> T\xe9l\xe9phone</span>
                  <span className="font-semibold text-[#111111]">{guestPhone || '—'}</span>
                </div>
                {orderMode === 'with_menu' && menuTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><UtensilsCrossed className="size-4" /> Menu</span>
                    <span className="font-semibold text-[#D4AF37]">{menuTotal.toFixed(2)} TND</span>
                  </div>
                )}
                {tablePrice > 0 && orderMode === 'table_only' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">Minimum</span>
                    <span className="font-semibold text-[#D4AF37]">{tablePrice} TND</span>
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

  // ── Dialog content wrapper (responsive: sheet on mobile, dialog on desktop) ──
  const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
    // We use Sheet for bottom-sheet feel on all screens, which works well for this flow
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-white border-t border-gray-200 rounded-t-3xl p-0 max-h-[95vh] overflow-y-auto sm:max-h-[90vh]">
          {children}
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <ModalWrapper>
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      <SheetHeader className="px-5 pt-2 pb-0">
        <SheetTitle className="text-[#111111] text-base font-semibold">R\xe9server une table</SheetTitle>
        <SheetDescription className="sr-only">Flow de r\xe9servation en \xe9tapes</SheetDescription>
      </SheetHeader>

      <div className="px-5 py-4 space-y-5">
        {/* Step indicator */}
        <StepIndicator current={step} total={STEPS_COUNT} />

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="size-4" /> Retour
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
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
                'flex-1 flex items-center justify-center gap-2 rounded-xl font-bold py-3.5 text-sm transition-all active:scale-[0.98]',
                canProceed
                  ? 'bg-[#D4AF37] hover:bg-[#C4A030] text-white shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              Continuer <ArrowRight className="size-4" />
            </button>
          ) : (
            <div className="flex-1 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37] bg-white text-[#D4AF37] font-bold py-3.5 text-sm hover:bg-[#D4AF37]/5 active:scale-[0.98] transition-all"
              >
                <ShoppingCart className="size-4" /> Panier
              </button>
              <button
                type="button"
                onClick={handleReserve}
                disabled={loading || !guestPhone.trim()}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-xl font-bold py-3.5 text-sm transition-all active:scale-[0.98]',
                  'bg-[#D4AF37] hover:bg-[#C4A030] text-white shadow-lg shadow-[#D4AF37]/20',
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
    </ModalWrapper>
  );
}
