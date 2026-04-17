'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/lib/api/types';

function getVenueName(r: Reservation): string {
  const v = r.venueId;
  if (typeof v === 'object' && v?.name) return v.name;
  return 'Lieu';
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
  EXPIRED: 'Expirée',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'outline',
  EXPIRED: 'outline',
};

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  cancelLoading?: boolean;
  className?: string;
}

export function ReservationCard({
  reservation,
  onCancel,
  cancelLoading,
  className,
}: ReservationCardProps) {
  const venueName = getVenueName(reservation);
  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);
  const status = reservation.status;
  const canCancel = status === 'PENDING' || status === 'CONFIRMED';

  return (
    <Card className={cn('bg-white border-gray-200 shadow-md', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div>
          <h3 className="font-semibold text-[#111111]">{venueName}</h3>
          <p className="text-sm text-gray-600">
            {reservation.confirmationCode && `#${reservation.confirmationCode}`}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>{STATUS_LABEL[status] ?? status}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="size-4 shrink-0" />
          <span>
            {start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
            {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -{' '}
            {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {reservation.partySize != null && (
          <p className="text-sm text-gray-600">{reservation.partySize} personne(s)</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/reservations/${reservation._id}`}>Voir</Link>
          </Button>
          {canCancel && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onCancel(reservation._id)}
              disabled={cancelLoading}
            >
              Annuler
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
