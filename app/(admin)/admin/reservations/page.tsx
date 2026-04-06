'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminReservations } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableRowSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { Calendar } from 'lucide-react';

export default function AdminReservationsPage() {
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => fetchAdminReservations(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Réservations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Liste des réservations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={4} />
                  ))}
                </TableBody>
              </Table>
            ) : reservations.length === 0 ? (
              <EmptyState
                icon={<Calendar className="size-12" />}
                title="Aucune réservation"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(reservations as { _id: string; confirmationCode?: string; venueId?: { name?: string }; startAt?: string; status?: string }[]).map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.confirmationCode ?? r._id}</TableCell>
                      <TableCell>{typeof r.venueId === 'object' ? r.venueId?.name : '—'}</TableCell>
                      <TableCell>{r.startAt ? new Date(r.startAt).toLocaleString('fr-FR') : '—'}</TableCell>
                      <TableCell>{r.status ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
