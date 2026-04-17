'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminReservations, fetchAdminVenues, fetchAdminUsers, fetchAdminEvents } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { VENUE_TYPE_LABELS } from '@/app/constants/venueTypes';

// ── Chart Colors ───────────────────────────────────────────────

const CHART_COLORS = [
  '#f59e0b', // Amber (primary)
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
];

const EMPTY_COLOR = '#71717a';

// ── Stat Card with Trend ───────────────────────────────────────

interface StatWithTrendProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function StatWithTrend({ title, value, icon: Icon, iconColor, iconBg }: StatWithTrendProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-300">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight text-white">{value.toLocaleString('fr-FR')}</p>
        <div className="flex items-center gap-1 mt-1">
          <ArrowUpRight className="size-3 text-emerald-400" />
          <span className="text-xs text-zinc-500">Total enregistré</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Custom Tooltip for Charts ──────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-lg">
        <p className="text-sm font-medium text-zinc-200 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-zinc-400">{entry.name}:</span>
            <span className="font-semibold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ── Main Dashboard Charts ──────────────────────────────────────

export function DashboardCharts() {
  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => fetchAdminReservations(),
  });

  const { data: venues = [], isLoading: loadingVenues } = useQuery({
    queryKey: ['admin', 'venues'],
    queryFn: () => fetchAdminVenues(),
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => fetchAdminUsers(),
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => fetchAdminEvents(),
  });

  const isLoading = loadingReservations || loadingVenues || loadingUsers || loadingEvents;

  // Prepare venue type distribution data
  const venueTypeData = (venues as any[]).reduce((acc: Record<string, number>, v: any) => {
    const type = v.type || 'Autre';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const venueTypeChartData = Object.entries(venueTypeData).map(([type, count]) => ({
    name: VENUE_TYPE_LABELS[type] || type,
    value: count,
  }));

  // Prepare reservations by status
  const reservationStatusData = (reservations as any[]).reduce((acc: Record<string, number>, r: any) => {
    const status = r.status || 'Autre';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const reservationStatusChartData = Object.entries(reservationStatusData)
    .slice(0, 5)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  // Prepare users by role
  const userRoleData = (users as any[]).reduce((acc: Record<string, number>, u: any) => {
    const role = u.role || 'USER';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const userRoleChartData = Object.entries(userRoleData).map(([role, count]) => ({
    name: role,
    value: count,
  }));

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <Skeleton className="h-4 w-40 bg-zinc-800" />
            <Skeleton className="h-3 w-60 bg-zinc-800 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-zinc-800" />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <Skeleton className="h-4 w-40 bg-zinc-800" />
            <Skeleton className="h-3 w-60 bg-zinc-800 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-zinc-800" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Venue Type Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-zinc-100">
              Répartition des lieux par type
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Distribution des {(venues as any[]).length} lieux selon leur catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {venueTypeChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                <MapPin className="size-8 mb-2" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={venueTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-zinc-100">
              Types de lieux
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Proportion par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {venueTypeChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                <MapPin className="size-8 mb-2" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={venueTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {venueTypeChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reservations & Users */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-zinc-100">
              Réservations par statut
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {(reservations as any[]).length} réservations au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservationStatusChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                <Calendar className="size-8 mb-2" />
                <p className="text-sm">Aucune réservation</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reservationStatusChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    type="number"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-zinc-100">
              Utilisateurs par rôle
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {(users as any[]).length} utilisateurs au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRoleChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                <Users className="size-8 mb-2" />
                <p className="text-sm">Aucun utilisateur</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {userRoleChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
