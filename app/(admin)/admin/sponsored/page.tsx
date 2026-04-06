'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminVenues,
  fetchAdminEvents,
  updateAdminVenue,
  updateAdminEvent,
} from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, CalendarDays, Star, Search, TrendingUp, ChevronDown, ChevronUp, Image as ImageIcon, Hash } from 'lucide-react';
import { toast } from 'sonner';

type AdminVenueRow = {
  _id: string;
  name: string;
  city?: string;
  type?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  sponsoredOrder?: number;
  bannerImage?: string;
  coverImage?: string;
};

type AdminEventRow = {
  _id: string;
  title: string;
  type?: string;
  startAt?: string;
  isPublished?: boolean;
  isSponsored?: boolean;
  coverImage?: string;
  imageUrl?: string;
};

export default function AdminSponsoredPage() {
  const qc = useQueryClient();
  const [venueSearch, setVenueSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const [bannerInputs, setBannerInputs] = useState<Record<string, { bannerImage: string; sponsoredOrder: string }>>({});

  const { data: rawVenues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['admin', 'venues', 'all'],
    queryFn: () => fetchAdminVenues(),
  });
  const venues = rawVenues as AdminVenueRow[];

  const { data: rawEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['admin', 'events', 'all'],
    queryFn: () => fetchAdminEvents(),
  });
  const events = rawEvents as AdminEventRow[];

  const venueMut = useMutation({
    mutationFn: (payload: { id: string; isSponsored?: boolean; isFeatured?: boolean; sponsoredOrder?: number; bannerImage?: string | null }) =>
      updateAdminVenue(payload.id, {
        isSponsored: payload.isSponsored,
        isFeatured: payload.isFeatured,
        sponsoredOrder: payload.sponsoredOrder,
        bannerImage: payload.bannerImage,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'venues', 'all'] });
      toast.success('Mis à jour');
    },
    onError: () => toast.error('Erreur'),
  });

  const toggleExpand = (venue: AdminVenueRow) => {
    if (expandedVenueId === venue._id) {
      setExpandedVenueId(null);
    } else {
      setExpandedVenueId(venue._id);
      setBannerInputs((prev) => ({
        ...prev,
        [venue._id]: {
          bannerImage: prev[venue._id]?.bannerImage ?? venue.bannerImage ?? '',
          sponsoredOrder: prev[venue._id]?.sponsoredOrder ?? String(venue.sponsoredOrder ?? 0),
        },
      }));
    }
  };

  const saveSponsoredDetails = (venue: AdminVenueRow) => {
    const inputs = bannerInputs[venue._id];
    if (!inputs) return;
    venueMut.mutate({
      id: venue._id,
      bannerImage: inputs.bannerImage.trim() || null,
      sponsoredOrder: parseInt(inputs.sponsoredOrder) || 0,
    });
  };

  const eventMut = useMutation({
    mutationFn: ({ id, isSponsored }: { id: string; isSponsored: boolean }) =>
      updateAdminEvent(id, { isSponsored }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'events', 'all'] });
      toast.success('Mis à jour');
    },
    onError: () => toast.error('Erreur'),
  });

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    (v.city ?? '').toLowerCase().includes(venueSearch.toLowerCase())
  );
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const sponsoredVenues = venues.filter((v) => v.isSponsored).length;
  const featuredVenues = venues.filter((v) => v.isFeatured).length;
  const sponsoredEvents = events.filter((e) => e.isSponsored).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contenus sponsorisés</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gérez les lieux et événements mis en avant
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lieux sponsorisés</p>
                <p className="text-2xl font-bold">{sponsoredVenues}</p>
              </div>
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="size-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lieux en vedette</p>
                <p className="text-2xl font-bold">{featuredVenues}</p>
              </div>
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Événements sponsorisés</p>
                <p className="text-2xl font-bold">{sponsoredEvents}</p>
              </div>
              <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <CalendarDays className="size-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="venues">
        <TabsList className="mb-4">
          <TabsTrigger value="venues" className="gap-2">
            <MapPin className="size-3.5" />
            Lieux
            {sponsoredVenues > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{sponsoredVenues}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <CalendarDays className="size-3.5" />
            Événements
            {sponsoredEvents > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{sponsoredEvents}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Venues tab */}
        <TabsContent value="venues">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-sm font-medium">
                  {filteredVenues.length} lieu{filteredVenues.length !== 1 ? 'x' : ''}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    className="pl-8 h-8 text-sm w-[200px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {venuesLoading ? (
                <div className="space-y-0 divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3">
                      <Skeleton className="size-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-10 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredVenues.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                  Aucun lieu trouvé
                </div>
              ) : (
                <div className="divide-y">
                  {filteredVenues.map((venue) => (
                    <div key={venue._id}>
                      <div className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                        <div className="size-10 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                          {(venue.bannerImage || venue.coverImage) ? (
                            <Image
                              src={(venue.bannerImage || venue.coverImage)!}
                              alt={venue.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <MapPin className="size-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{venue.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {venue.city && <span className="text-xs text-muted-foreground">{venue.city}</span>}
                            {venue.type && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{venue.type}</Badge>
                            )}
                            {venue.isSponsored && venue.sponsoredOrder != null && venue.sponsoredOrder > 0 && (
                              <Badge className="text-[10px] h-4 px-1.5 bg-amber-500/20 text-amber-600 border-amber-500/30">
                                #{venue.sponsoredOrder}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">Vedette</span>
                            <Switch
                              checked={!!venue.isFeatured}
                              onCheckedChange={(v) => venueMut.mutate({ id: venue._id, isFeatured: v })}
                              disabled={venueMut.isPending}
                              className="scale-75"
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Star className="size-2.5 text-amber-500" />
                              Sponsorisé
                            </span>
                            <Switch
                              checked={!!venue.isSponsored}
                              onCheckedChange={(v) => venueMut.mutate({ id: venue._id, isSponsored: v })}
                              disabled={venueMut.isPending}
                              className="scale-75"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleExpand(venue)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            aria-label="Paramètres"
                          >
                            {expandedVenueId === venue._id
                              ? <ChevronUp className="size-4" />
                              : <ChevronDown className="size-4" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* Expanded sponsorship details */}
                      {expandedVenueId === venue._id && (
                        <div className="px-5 pb-4 pt-2 bg-muted/20 border-t">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Paramètres de mise en avant — {venue.name}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs flex items-center gap-1.5">
                                <ImageIcon className="size-3" /> URL bannière
                              </Label>
                              <Input
                                type="url"
                                placeholder="https://example.com/banner.jpg"
                                value={bannerInputs[venue._id]?.bannerImage ?? ''}
                                onChange={(e) =>
                                  setBannerInputs((prev) => ({
                                    ...prev,
                                    [venue._id]: { ...prev[venue._id], bannerImage: e.target.value },
                                  }))
                                }
                                className="h-8 text-sm"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Image utilisée dans le hero slider (1920×600 recommandé)
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs flex items-center gap-1.5">
                                <Hash className="size-3" /> Ordre d&apos;affichage
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={bannerInputs[venue._id]?.sponsoredOrder ?? '0'}
                                onChange={(e) =>
                                  setBannerInputs((prev) => ({
                                    ...prev,
                                    [venue._id]: { ...prev[venue._id], sponsoredOrder: e.target.value },
                                  }))
                                }
                                className="h-8 text-sm"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Priorité dans le carrousel (1 = premier)
                              </p>
                            </div>
                          </div>
                          {bannerInputs[venue._id]?.bannerImage && (
                            <div className="relative h-20 w-full rounded-lg overflow-hidden mb-3 bg-muted">
                              <Image
                                src={bannerInputs[venue._id].bannerImage}
                                alt="Aperçu bannière"
                                fill
                                className="object-cover"
                                sizes="400px"
                                onError={() => {}}
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveSponsoredDetails(venue)}
                              disabled={venueMut.isPending}
                              className="h-8 text-xs gap-1.5"
                            >
                              Enregistrer
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedVenueId(null)}
                              className="h-8 text-xs"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-sm font-medium">
                  {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="pl-8 h-8 text-sm w-[200px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {eventsLoading ? (
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3">
                      <Skeleton className="size-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                  Aucun événement trouvé
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEvents.map((event) => (
                    <div key={event._id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="size-10 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                        {(event.coverImage || event.imageUrl) ? (
                          <Image src={(event.coverImage ?? event.imageUrl)!} alt={event.title} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <CalendarDays className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {event.type && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">{event.type}</Badge>
                          )}
                          {event.startAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.startAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Star className="size-2.5 text-amber-500" />
                          Sponsorisé
                        </span>
                        <Switch
                          checked={!!event.isSponsored}
                          onCheckedChange={(v) => eventMut.mutate({ id: event._id, isSponsored: v })}
                          disabled={eventMut.isPending}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
