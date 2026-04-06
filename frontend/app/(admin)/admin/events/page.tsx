'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminEvents } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableRowSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

type AdminEventRow = { _id: string; title: string; type: string; startAt: string; venueId?: { name?: string; _id?: string } };

export default function AdminEventsPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: fetchAdminEvents,
  });
  const list = events as AdminEventRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Événements</h1>
      <Card>
        <CardHeader>
          <CardTitle>Liste des événements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))}
              </TableBody>
            </Table>
          ) : events.length === 0 ? (
            <EmptyState icon={<Calendar className="size-12" />} title="Aucun événement" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell>{new Date(e.startAt).toLocaleString('fr-FR')}</TableCell>
                    <TableCell>{typeof e.venueId === 'object' ? e.venueId?.name : '—'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/events/${e._id}`}>Modifier</Link>
                      </Button>
                    </TableCell>
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
