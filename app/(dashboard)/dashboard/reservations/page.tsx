'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyReservations, cancelReservation } from '@/lib/api/reservations';
import { ReservationCard } from '@/components/cards/ReservationCard';
import { ReservationCardSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', 'me'],
    queryFn: fetchMyReservations,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] }),
  });

  const now = new Date();
  const upcoming = reservations.filter((r) => new Date(r.startAt) >= now && r.status !== 'CANCELLED');
  const past = reservations.filter((r) => new Date(r.startAt) < now && r.status !== 'CANCELLED');
  const cancelled = reservations.filter((r) => r.status === 'CANCELLED');

  const filterBySearch = (list: typeof reservations) => {
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((r) => {
      const venueName = typeof r.venueId === 'object' ? r.venueId?.name : '';
      const code = r.confirmationCode ?? '';
      return venueName?.toLowerCase().includes(s) || code.toLowerCase().includes(s);
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes réservations</h1>
      <Input
        type="search"
        placeholder="Rechercher par lieu ou code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Passées ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <ReservationCardSkeleton />
              <ReservationCardSkeleton />
            </div>
          ) : filterBySearch(upcoming).length === 0 ? (
            <EmptyState
              icon={<Calendar className="size-12" />}
              title="Aucune réservation à venir"
              description="Explorez les lieux et réservez."
            />
          ) : (
            <div className="space-y-4">
              {filterBySearch(upcoming).map((r) => (
                <ReservationCard
                  key={r._id}
                  reservation={r}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  cancelLoading={cancelMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {filterBySearch(past).length === 0 ? (
            <EmptyState title="Aucune réservation passée" />
          ) : (
            <div className="space-y-4">
              {filterBySearch(past).map((r) => (
                <ReservationCard key={r._id} reservation={r} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          {filterBySearch(cancelled).length === 0 ? (
            <EmptyState title="Aucune réservation annulée" />
          ) : (
            <div className="space-y-4">
              {filterBySearch(cancelled).map((r) => (
                <ReservationCard key={r._id} reservation={r} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
