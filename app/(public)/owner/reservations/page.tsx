'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGetRaw } from '@/lib/api/client';

export default function OwnerReservationsPage() {
  const { data = [] } = useQuery({
    queryKey: ['owner-reservations'],
    queryFn: () => apiGetRaw<any[]>('/owner/reservations'),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10 text-zinc-100">
      <h1 className="text-2xl font-semibold">Reservations proprietaire</h1>
      <div className="space-y-2">
        {(data || []).map((r: any) => (
          <div key={r._id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm">
            <span className="font-medium">{typeof r.venueId === 'object' ? r.venueId?.name : 'Lieu'}</span> - {r.status}
          </div>
        ))}
      </div>
    </div>
  );
}
