'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGetRaw } from '@/lib/api/client';

export default function OwnerMyEstablishmentPage() {
  const { data = [] } = useQuery({
    queryKey: ['owner-venues'],
    queryFn: () => apiGetRaw<any[]>('/owner/venues'),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10 text-zinc-100">
      <h1 className="text-2xl font-semibold">Mon etablissement</h1>
      {(data || []).map((v: any) => (
        <div key={v._id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="font-semibold">{v.name}</p>
          <p className="text-sm text-zinc-400">{v.city} - {v.type}</p>
        </div>
      ))}
    </div>
  );
}
