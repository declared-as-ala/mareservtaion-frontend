'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  accent: string;
}

function StatCard({ title, value, icon: Icon, href, description, accent }: StatCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center justify-center size-9 rounded-lg ${accent}`}>
            <Icon className="size-4" />
          </div>
          <ArrowUpRight className="size-4 text-zinc-700 group-hover:text-zinc-400 transition-colors duration-200" />
        </div>
        <p className="text-2xl font-semibold text-zinc-100 tracking-tight tabular-nums">
          {value.toLocaleString('fr-FR')}
        </p>
        <p className="mt-1 text-sm font-medium text-zinc-400">{title}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
    </Link>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="size-9 rounded-lg bg-white/[0.05] animate-pulse" />
      </div>
      <div>
        <div className="h-7 w-16 rounded bg-white/[0.05] animate-pulse" />
        <div className="mt-2 h-3.5 w-24 rounded bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Vue d&apos;ensemble de la plateforme Ma Reservation
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Utilisateurs"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            href="/admin/users"
            description="Comptes enregistrés"
            accent="bg-amber-500/15 border border-amber-500/20"
          />
          <StatCard
            title="Lieux"
            value={stats?.totalVenues ?? 0}
            icon={MapPin}
            href="/admin/venues"
            description="Établissements actifs"
            accent="bg-emerald-500/15 border border-emerald-500/20"
          />
          <StatCard
            title="Réservations"
            value={stats?.totalReservations ?? 0}
            icon={Calendar}
            href="/admin/reservations"
            description="Total traité"
            accent="bg-blue-500/15 border border-blue-500/20"
          />
          <StatCard
            title="Événements"
            value={stats?.totalEvents ?? 0}
            icon={FileText}
            href="/admin/events"
            description="Planifiés ou en cours"
            accent="bg-purple-500/15 border border-purple-500/20"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white/80">Actions rapides</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            className="bg-amber-500 text-black font-medium hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/20"
          >
            <Link href="/admin/venues" className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              Gérer les lieux
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.14] transition-all duration-200"
          >
            <Link href="/admin/reservations" className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Réservations
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.14] transition-all duration-200"
          >
            <Link href="/admin/users" className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              Utilisateurs
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.14] transition-all duration-200"
          >
            <Link href="/admin/events" className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Événements
            </Link>
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/80">Analyses & statistiques</h2>
          <span className="text-xs text-white/25">30 derniers jours</span>
        </div>
        <DashboardCharts />
      </div>
    </div>
  );
}
