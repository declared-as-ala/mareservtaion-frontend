import Link from 'next/link';
import { AppContainer } from '@/components/shared/AppContainer';

const categories = [
  { label: 'Cafés', href: '/cafes' },
  { label: 'Restaurants', href: '/restaurants' },
  { label: 'Hôtels', href: '/hotels' },
  { label: 'Cinéma', href: '/cinema' },
  { label: 'Événements', href: '/evenements' },
];

const legal = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Conditions générales', href: '/cgv' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-8 md:py-10">
      <AppContainer>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="text-lg font-semibold">
              Ma Reservation
            </Link>
            <p className="text-sm text-muted-foreground">
              Réservez vos tables, chambres et places en quelques clics.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Explorer</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explorer" className="text-sm text-muted-foreground hover:text-foreground">
                  Tous les lieux
                </Link>
              </li>
              {categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Aide</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Mentions légales</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ma Reservation. Tous droits réservés.
        </p>
      </AppContainer>
    </footer>
  );
}
