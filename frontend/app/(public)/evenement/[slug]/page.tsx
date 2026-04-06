'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchEventByIdOrSlug } from '@/lib/api/events';
import { DetailPageSkeleton } from '@/components/shared/skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import { DetailHeader } from '@/components/detail/DetailHeader';
import { DetailTwoColumnLayout } from '@/components/detail/DetailTwoColumnLayout';
import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/shared/TypeBadge';
import { useCartStore } from '@/stores/cart';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

function getVenueId(ev: { venueId: string | { _id: string; name?: string } }): string | null {
  const v = ev.venueId;
  if (typeof v === 'object' && v?._id) return v._id;
  if (typeof v === 'string') return v;
  return null;
}
function getVenueName(ev: { venueId: string | { name?: string } }): string {
  const v = ev.venueId;
  if (typeof v === 'object' && v?.name) return v.name;
  return '';
}

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => fetchEventByIdOrSlug(slug),
    enabled: !!slug,
  });

  if (!slug) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Identifiant manquant.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/evenements">Événements</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <DetailPageSkeleton />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ErrorState
          title="Événement introuvable"
          message="Cet événement n'existe pas ou a été supprimé."
          onRetry={() => refetch()}
        />
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/evenements">Voir les événements</Link>
        </Button>
      </div>
    );
  }

  const start = new Date(event.startAt);
  const venueId = getVenueId(event);
  const venueName = getVenueName(event);

  const handleAddToCart = () => {
    addItem({
      id: `event-${event._id}-${Date.now()}`,
      type: 'event_ticket',
      title: event.title,
      imageUrl: event.imageUrl,
      unitLabel: 'Billet',
      unitType: event.type,
      dateTime: event.startAt,
      price: 0,
      quantity: 1,
      eventId: event._id,
      slug: event.slug,
    });
    toast.success('Ajouté au panier');
  };

  const bookingSidebar = (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="font-semibold">Billets</h3>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Calendar className="size-4" />
          {start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4" />
          {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <Button onClick={handleAddToCart} className="w-full">
          Ajouter au panier
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/login?returnTo=${encodeURIComponent(`/evenement/${event.slug || event._id}`)}`}>
            Réserver (connexion)
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <DetailHeader
        title={event.title}
        subtitle={venueName ? `Lieu : ${venueName}` : undefined}
        imageUrl={event.imageUrl ?? null}
        imageAlt={event.title}
        badges={
          <>
            <TypeBadge type={event.type} />
            {event.isSponsored && (
              <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-xs font-medium text-white">
                Sponsorisé
              </span>
            )}
          </>
        }
        metaRight={
          <div className="space-y-1 text-right">
            <p className="font-semibold uppercase tracking-wide">
              {start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-lg">{start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        }
      />
      <DetailTwoColumnLayout sidebar={bookingSidebar}>
        <div className="space-y-6">
          {event.description && (
            <p className="whitespace-pre-wrap text-muted-foreground">{event.description}</p>
          )}
          {venueId && (
            <Button variant="outline" asChild>
              <Link href={`/lieu/${venueId}`}>Voir le lieu</Link>
            </Button>
          )}
        </div>
      </DetailTwoColumnLayout>
    </div>
  );
}
