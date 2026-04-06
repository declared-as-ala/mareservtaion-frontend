'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Calendar, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  });

  return (
    <div
      className="relative min-h-[calc(100vh-3rem)] rounded-xl bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
      }}
    >
      <div className="absolute inset-0 rounded-xl bg-background/85 backdrop-blur-[2px]" />
      <div className="relative space-y-8 p-1">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord admin</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble et statistiques.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lieux</CardTitle>
              <MapPin className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalVenues ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Réservations</CardTitle>
              <Calendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalReservations ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalEvents ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/admin/venues">Gérer les lieux</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/reservations">Voir les réservations</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Voir les utilisateurs</Link>
        </Button>
      </div>
      </div>
    </div>
  );
}
