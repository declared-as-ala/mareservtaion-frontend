'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminVenues } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableRowSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { MapPin } from 'lucide-react';
import { VENUE_TYPE_LABELS } from '@/app/constants/venueTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TYPE_OPTIONS = [
  { value: '', label: 'Tous' },
  ...Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

type VenueRow = { _id: string; name: string; type: string; city: string; coverImage?: string };

export default function AdminVenuesPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [q, setQ] = useState('');

  const { data: venuesData = [], isLoading } = useQuery({
    queryKey: ['admin', 'venues', typeFilter, q],
    queryFn: () => fetchAdminVenues({ type: typeFilter || undefined, q: q || undefined }),
  });
  const venues = venuesData as VenueRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lieux</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des lieux</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Rechercher (nom, ville…)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))}
              </TableBody>
            </Table>
          ) : venues.length === 0 ? (
            <EmptyState
              icon={<MapPin className="size-12" />}
              title="Aucun lieu"
              description="Les lieux créés apparaîtront ici."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>
                      {v.coverImage ? (
                        <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                          <Image src={v.coverImage} alt="" fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{VENUE_TYPE_LABELS[v.type] ?? v.type}</TableCell>
                    <TableCell>{v.city}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/venues/${v._id}`}>Modifier</Link>
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
