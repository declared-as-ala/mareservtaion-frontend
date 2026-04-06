'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Sparkles,
  CalendarDays,
  Compass,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { UserMenuDropdown } from '@/components/layout/UserMenuDropdown';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const categories = [
  { label: 'Explorer les lieux', href: '/explorer', icon: Compass },
  { label: 'Événements', href: '/evenements', icon: CalendarDays },
];


export function HomeNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { user, accessToken, fetchMe } = useAuthStore();
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const [hasHydrated, setHasHydrated] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const t = setTimeout(() => setHasHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (accessToken && !user) fetchMe();
  }, [hasHydrated, accessToken, user, fetchMe]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const bgClass = isHome
    ? scrolled
      ? 'bg-black/95 shadow-lg shadow-black/20'
      : 'bg-black/75'
    : 'bg-black/95 shadow-sm shadow-black/10';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-300',
          bgClass
        )}
      >
        <div className="mx-auto flex h-[120px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-36 lg:px-8 overflow-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 pr-4 py-1">
            <Image
              src="/logo.png"
              alt="Ma Reservation"
              width={400}
              height={110}
              className="h-20 w-auto object-contain lg:h-32 drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {categories.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '?');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'text-amber-300 bg-amber-400/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.07]'
                  )}
                >
                  <Icon className="size-3.5 opacity-80" />
                  {link.label}
                </Link>
              );
            })}

            {/* SOS Conseil pill */}
            <Link
              href="/sos-conseil"
              className={cn(
                'ml-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 border',
                pathname === '/sos-conseil'
                  ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                  : 'border-amber-400/50 text-amber-300 hover:bg-amber-400/10 hover:border-amber-400 hover:text-amber-200'
              )}
            >
              <Sparkles className="size-3.5 shrink-0" />
              SOS Conseil
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={cn(
                'flex items-center justify-center size-9 rounded-lg transition-all',
                searchOpen
                  ? 'text-amber-300 bg-amber-400/10'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.07]'
              )}
              aria-label="Recherche"
            >
              <Search className="size-4" />
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center size-9 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.07] transition-all"
              aria-label="Panier"
            >
              <ShoppingBag className="size-4" />
              {/* Badge only after mount: cart is persisted in localStorage — SSR has no cart, client would mismatch */}
              {hasHydrated && totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black">
                  {totalQuantity > 9 ? '9+' : totalQuantity}
                </span>
              )}
            </button>

            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

            {/* Theme toggle */}
            <div className="text-neutral-300 hover:text-white">
              <ThemeToggle />
            </div>

            {/* Auth — desktop (defer until hydrated: persisted user differs SSR vs client) */}
            <div className="hidden md:flex items-center gap-2 ml-1">
              {!hasHydrated ? (
                <div className="h-9 w-[152px] rounded-lg bg-white/5" aria-hidden />
              ) : user ? (
                <UserMenuDropdown />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-neutral-300 hover:text-white hover:bg-white/[0.07] transition-all"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[13px] font-semibold hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/25"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="ml-1 flex items-center justify-center size-9 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.07] transition-all md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-white/[0.06] bg-black/95 px-4 py-3 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                <input
                  ref={searchRef}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Rechercher un lieu, restaurant, événement..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-all"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/[0.06] bg-black/98 px-4 pb-6 pt-4 md:hidden">
            <nav className="flex flex-col gap-1 mb-4">
              {categories.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'text-amber-300 bg-amber-400/10'
                        : 'text-neutral-300 hover:text-white hover:bg-white/[0.07]'
                    )}
                  >
                    <Icon className="size-4 opacity-80" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* SOS Conseil — mobile */}
            <div className="pt-2">
              <Link
                href="/sos-conseil"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors border',
                  pathname === '/sos-conseil'
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'border-amber-400/40 text-amber-300 hover:bg-amber-400/10 hover:border-amber-400'
                )}
              >
                <Sparkles className="size-4 shrink-0" />
                SOS Conseil
              </Link>
            </div>

            <div className="border-t border-white/[0.06] pt-4">
              {!hasHydrated ? (
                <div className="h-24 rounded-xl bg-white/5" aria-hidden />
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <UserMenuDropdown />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-xl border border-white/15 text-sm font-medium text-neutral-300 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-sm font-semibold hover:from-amber-300 hover:to-amber-400 transition-all"
                  >
                    S&apos;inscrire gratuitement
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header on non-home pages */}
      {!isHome && <div className="h-[120px] lg:h-36" />}
    </>
  );
}
