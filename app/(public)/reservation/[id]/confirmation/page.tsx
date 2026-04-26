'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchReservationById } from '@/lib/api/reservations';
import { Button } from '@/components/ui/button';
import { DetailPageSkeleton } from '@/components/shared/skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  Calendar,
  CheckCircle2,
  QrCode,
  Users,
  MapPin,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */
function getVenueName(r: { venueId: string | { name?: string } }) {
  const v = r.venueId;
  if (typeof v === 'object' && v?.name) return v.name;
  return 'Lieu';
}

function getVenueId(r: { venueId: string | { _id?: string } }): string {
  const v = r.venueId;
  if (typeof v === 'object' && v?._id) return v._id;
  return typeof v === 'string' ? v : '';
}

/* ------------------------------------------------------------------ */
/* Main page                                                             */
/* ------------------------------------------------------------------ */
export default function ReservationConfirmationPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: reservation, isLoading, error, refetch } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => fetchReservationById(id),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="container px-4 py-12 text-center">
        <p className="text-zinc-400">Réservation introuvable.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/mes-reservations">Mes réservations</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container px-4 py-8"><DetailPageSkeleton /></div>;
  }

  if (error || !reservation) {
    return (
      <div className="container px-4 py-12">
        <ErrorState title="Réservation introuvable" onRetry={() => refetch()} />
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/mes-reservations">Mes réservations</Link>
        </Button>
      </div>
    );
  }

  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);
  const venueName = getVenueName(reservation);
  const venueId = getVenueId(reservation);
  const code = reservation.confirmationCode ?? reservation.reservationCode ?? reservation._id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Success header */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <div className="mx-auto size-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Réservation confirmée !</h1>
          <p className="text-zinc-400 text-sm mb-4">
            Votre réservation a bien été enregistrée.
          </p>
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-5 py-2">
            <QrCode className="size-4 text-amber-400" />
            <span className="font-mono text-amber-400 font-semibold tracking-wider text-sm">
              {code}
            </span>
          </div>
        </div>

        {/* Reservation details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-100 text-lg">{venueName}</h2>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="size-4 text-amber-400/60 shrink-0" />
              <span>
                {start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin className="size-4 text-amber-400/60 shrink-0" />
              <span>
                {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {reservation.partySize != null && (
              <div className="flex items-center gap-2 text-zinc-400">
                <Users className="size-4 text-amber-400/60 shrink-0" />
                <span>{reservation.partySize} personne{reservation.partySize > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          {reservation.totalPrice != null && reservation.totalPrice > 0 && (
            <p className="text-amber-400 font-semibold">
              Total : {reservation.totalPrice} TND
            </p>
          )}
        </div>

        {/* QR Code */}
        {reservation.qrCodeImageUrl ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold mb-4">
              <QrCode className="size-5 text-amber-400" />
              QR Code d&apos;entrée
            </div>
            <div className="inline-block bg-white p-3 rounded-xl shadow-lg">
              <Image
                src={reservation.qrCodeImageUrl}
                alt="QR Code"
                width={180}
                height={180}
                className="rounded"
              />
            </div>
            <p className="text-zinc-500 text-xs mt-3">
              Présentez ce code à l&apos;entrée du lieu
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
            <QrCode className="size-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm font-mono tracking-widest">{code}</p>
            <p className="text-zinc-600 text-xs mt-1">Présentez ce code à l&apos;entrée</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold">
            <Link href="/mes-reservations">Voir mes réservations</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Link href="/explorer">Explorer les lieux</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
