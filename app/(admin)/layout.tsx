'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  MapPin,
  CalendarDays,
  Settings,
  Tags,
  FolderTree,
  Image as ImageIcon,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Bell,
  Star,
  Sparkles,
  QrCode,
  Layers,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { href: '/admin/users', label: 'Utilisateurs', icon: Users },
      { href: '/admin/venues', label: 'Lieux', icon: MapPin },
      { href: '/admin/events', label: 'Événements', icon: CalendarDays },
      { href: '/admin/reservations', label: 'Réservations', icon: BookOpen },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { href: '/admin/categories', label: 'Catégories', icon: FolderTree },
      { href: '/admin/tags', label: 'Tags', icon: Tags },
      { href: '/admin/banner-slides', label: 'Bannières', icon: ImageIcon },
      { href: '/admin/sponsored', label: 'Sponsorisés', icon: Star },
      { href: '/admin/scenes', label: 'Scènes 360°', icon: Layers },
    ],
  },
  {
    label: 'Conciergerie',
    items: [
      { href: '/admin/sos-conseil', label: 'SOS Conseil', icon: Sparkles },
      { href: '/admin/scanner', label: 'Scanner QR', icon: QrCode },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/settings', label: 'Paramètres', icon: Settings },
    ],
  },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
        <Image
          src="/logo.png"
          alt="Ma Reservation"
          width={400}
          height={110}
          className="h-20 w-auto object-contain"
          priority
        />
        <div className="flex items-center gap-1 ml-auto">
          <ShieldCheck className="size-3 text-amber-400" />
          <span className="text-[10px] text-amber-400 font-medium whitespace-nowrap">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent'
                    )}
                  >
                    <Icon className={cn('size-4 shrink-0', isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <ChevronRight className="ml-auto size-3 text-amber-400/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user panel */}
      <div className="border-t border-zinc-800 p-3">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors mb-1"
        >
          <ExternalLink className="size-3.5" />
          Voir le site
        </Link>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/40 mt-1">
            <div className="size-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[11px] font-black text-black shrink-0">
              {(user.fullName ?? user.email ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{user.fullName ?? user.email}</p>
              <p className="text-[10px] text-zinc-500">Administrateur</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="text-zinc-500 hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHasHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (accessToken && !user) {
      fetchMe().then((u) => {
        if (u && u.role !== 'ADMIN') router.replace('/unauthorized');
      });
    } else if (!accessToken) {
      router.replace('/login');
    } else if (user && user.role !== 'ADMIN') {
      router.replace('/unauthorized');
    }
  }, [hasHydrated, accessToken, user, fetchMe, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  if (!hasHydrated || !accessToken || (user && user.role !== 'ADMIN')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Ma Reservation" width={400} height={110} className="h-20 w-auto object-contain" />
          <p className="text-sm text-zinc-400">Vérification des droits...</p>
        </div>
      </div>
    );
  }

  // Derive page title from pathname
  const allItems = navGroups.flatMap((g) => g.items);
  const currentItem = allItems.find((i) =>
    i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + '/')
  );
  const pageTitle = currentItem?.label ?? 'Administration';

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-zinc-950 border-r border-zinc-800">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-zinc-950 border-r border-zinc-800 lg:hidden">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500 hidden sm:inline">Admin</span>
              <ChevronRight className="size-3.5 text-zinc-700 hidden sm:inline" />
              <span className="font-semibold text-zinc-100">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <Bell className="size-4" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800 border border-zinc-800"
            >
              <ExternalLink className="size-3" />
              Voir le site
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="size-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[11px] font-black text-black">
                {(user?.fullName ?? user?.email ?? 'A').charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-medium text-zinc-300 max-w-[120px] truncate">
                {user?.fullName ?? user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-zinc-900/30 p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
