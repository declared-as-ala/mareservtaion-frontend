'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEventByIdOrSlug } from '@/lib/api/events';
import { fetchAdminVenues } from '@/lib/api/admin';
import { updateAdminEvent } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DetailPageSkeleton } from '@/components/shared/skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type EventForm = {
  venueId: string;
  title: string;
  type: string;
  description: string;
  startAt: string;
  endsAt: string;
  coverImage: string;
  isPublished: boolean;
  isSponsored: boolean;
};

function toForm(event: Record<string, unknown>): EventForm {
  const venueId = event.venueId;
  const venueIdStr = typeof venueId === 'object' && venueId && '_id' in venueId
    ? String((venueId as { _id: string })._id)
    : String(venueId ?? '');
  const startAt = event.startAt ? new Date(event.startAt as string).toISOString().slice(0, 16) : '';
  const endsAt = event.endsAt ? new Date(event.endsAt as string).toISOString().slice(0, 16) : '';
  return {
    venueId: venueIdStr,
    title: String(event.title ?? ''),
    type: String(event.type ?? 'other'),
    description: String(event.description ?? ''),
    startAt,
    endsAt,
    coverImage: String(event.coverImage ?? event.afficheImageUrl ?? ''),
    isPublished: Boolean(event.isPublished !== false),
    isSponsored: Boolean(event.isSponsored),
  };
}

const EVENT_TYPES = [
  'concert', 'standup', 'cinema', 'sport', 'private', 'festival', 'other',
  'DJ', 'CHANTEUR', 'CONCERT', 'SOIREE', 'CINEMA', 'STANDUP', 'SPORTS', 'PRIVATE_EVENT', 'CINEMA_SESSION',
];

export default function AdminEventEditPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EventForm | null>(null);

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventByIdOrSlug(id),
    enabled: !!id,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ['admin', 'venues'],
    queryFn: () => fetchAdminVenues(),
  });
  const venueList = venues as { _id: string; name: string }[];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (event && typeof event === 'object') setForm(toForm(event as unknown as Record<string, unknown>));
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: (payload: EventForm) => updateAdminEvent(id, {
      venueId: payload.venueId,
      title: payload.title,
      type: payload.type,
      description: payload.description,
      startAt: payload.startAt || undefined,
      endsAt: payload.endsAt || undefined,
      coverImage: payload.coverImage || undefined,
      isPublished: payload.isPublished,
      isSponsored: payload.isSponsored,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast.success('Événement mis à jour.');
    },
    onError: (e: Error) => toast.error(e.message || 'Erreur lors de la mise à jour.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) updateMutation.mutate(form);
  };

  if (!id) {
    return (
      <div>
        <p className="text-muted-foreground">ID manquant.</p>
        <Button asChild><Link href="/admin/events">Retour</Link></Button>
      </div>
    );
  }

  if (isLoading) return <DetailPageSkeleton />;
  if (error || !event) {
    return (
      <div className="space-y-4">
        <ErrorState onRetry={() => refetch()} />
        <Button variant="outline" asChild><Link href="/admin/events">Liste des événements</Link></Button>
      </div>
    );
  }

  if (!form) return <DetailPageSkeleton />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/events" className="gap-2">
          <ArrowLeft className="size-4" /> Événements
        </Link>
      </Button>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Modifier l&apos;événement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venueId">Lieu</Label>
              <Select value={form.venueId} onValueChange={(v) => setForm({ ...form, venueId: v })}>
                <SelectTrigger id="venueId">
                  <SelectValue placeholder="Choisir un lieu" />
                </SelectTrigger>
                <SelectContent>
                  {venueList.map((v) => (
                    <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startAt">Date et heure de début</Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endsAt">Date et heure de fin</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className={cn(
                  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coverImage">URL image / affiche</Label>
              <Input
                id="coverImage"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Publié</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSponsored}
                  onChange={(e) => setForm({ ...form, isSponsored: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Sponsorisé</span>
              </label>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="size-4 mr-2" /> Enregistrer
          </Button>
          <Button variant="outline" type="button" asChild>
            <Link href={`/evenement/${(event as { slug?: string }).slug || id}`} target="_blank">Voir la fiche publique</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
