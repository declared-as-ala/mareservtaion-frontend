'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { GlobalSearchBar } from './GlobalSearchBar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenuDropdown } from './UserMenuDropdown';
import { CartDrawer } from './CartDrawer';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Explorer les lieux', href: '/explorer' },
  { name: 'Événements', href: '/evenements' },
];

export function Navbar() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const pathname = usePathname();
  const cartOpen = useCartStore((s) => s.drawerOpen);
  const openCart = useCartStore((s) => s.openDrawer);
  const closeCart = useCartStore((s) => s.closeDrawer);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[96px] sm:h-32 items-center justify-between gap-4 px-4 overflow-hidden">
        <Link href="/" className="flex items-center shrink-0 pl-1 sm:pl-2 py-1">
          <Image
            src="/logo.png"
            alt="Ma Reservation"
            width={400}
            height={110}
            className="h-16 w-auto object-contain sm:h-28 drop-shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
                pathname === cat.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {cat.name}
            </Link>
          ))}
          {/* SOS Conseil */}
          <Link
            href="/sos-conseil"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border',
              pathname === '/sos-conseil'
                ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'border-amber-400/50 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400'
            )}
          >
            <Sparkles className="size-3.5 shrink-0" />
            SOS Conseil
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Recherche"
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => openCart()}
            aria-label="Panier"
          >
            <ShoppingBag className="size-5" />
            {totalQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </Button>
          <CartDrawer open={cartOpen} onOpenChange={(v) => (v ? openCart() : closeCart())} />
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserMenuDropdown />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Inscription</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <Image
                    src="/logo.png"
                    alt="Ma Reservation"
                    width={320}
                    height={80}
                    className="h-20 w-auto object-contain"
                  />
                </Link>
                <GlobalSearchBar />
                <nav className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === cat.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {/* SOS Conseil mobile */}
                  <Link
                    href="/sos-conseil"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'mt-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border',
                      pathname === '/sos-conseil'
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'border-amber-400/40 text-amber-400 hover:bg-amber-400/10'
                    )}
                  >
                    <Sparkles className="size-4 shrink-0" />
                    SOS Conseil
                  </Link>
                </nav>
                <div className="border-t pt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link
                        href={isAdmin ? '/admin' : '/dashboard'}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Tableau de bord
                      </Link>
                      <Link
                        href={isAdmin ? '/admin/settings' : '/dashboard/profile'}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Mon profil
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium bg-primary text-primary-foreground text-center"
                      >
                        Inscription
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t px-4 py-3">
          <GlobalSearchBar />
        </div>
      )}
    </header>
  );
}
