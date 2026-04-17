'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminReservations } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  
  const style = styles[status.toLowerCase()] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700';
  
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}

export default function AdminReservationsPage() {
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => fetchAdminReservations(),
  });

  const list = (reservations as { _id: string; confirmationCode?: string; venueId?: { name?: string }; startAt?: string; status?: string }[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Réservations</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {list.length} réservation{list.length !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Table */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-4 border-b border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Calendar className="size-4 text-amber-400" />
            Liste des réservations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900/80">
                  <TableHead className="text-zinc-400">Code</TableHead>
                  <TableHead className="text-zinc-400">Lieu</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-zinc-800">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full bg-zinc-800" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Calendar className="size-12 mb-3" />
              <p className="text-sm font-medium">Aucune réservation</p>
              <p className="text-xs mt-1">Les réservations apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900/80">
                  <TableHead className="text-zinc-400">Code</TableHead>
                  <TableHead className="text-zinc-400">Lieu</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r._id} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors duration-150">
                    <TableCell>
                      <code className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 font-mono">
                        {r.confirmationCode ?? r._id.slice(-6)}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300 font-medium">
                      {typeof r.venueId === 'object' ? r.venueId?.name : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-zinc-500" />
                        {r.startAt ? new Date(r.startAt).toLocaleString('fr-FR', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.status ? <StatusBadge status={r.status} /> : <span className="text-zinc-500">—</span>}
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
