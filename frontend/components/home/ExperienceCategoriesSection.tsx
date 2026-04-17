import { AppContainer } from '@/components/shared/AppContainer';
import { Coffee, Wine, Utensils, Music2, Building2, Hotel, Waves, Flower2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const items = [
  { icon: Coffee, label: 'Cafés & Lounges', href: '/explorer?type=CAFE' },
  { icon: Wine, label: 'Bars & Rooftops', href: '/explorer?q=Bar' },
  { icon: Utensils, label: 'Restaurants Gastronomiques', href: '/explorer?type=RESTAURANT' },
  { icon: Music2, label: 'Clubs & Resto de Nuit', href: '/explorer?q=Club' },
  { icon: Building2, label: 'Salles & Événementiel', href: '/explorer?type=EVENT_SPACE' },
  { icon: Hotel, label: 'Hôtels & Resorts', href: '/explorer?type=HOTEL' },
  { icon: Waves, label: 'Beach Clubs', href: '/explorer?q=Beach' },
  { icon: Flower2, label: 'Spas & Bien-être', href: '/explorer?q=Spa' },
];

export function ExperienceCategoriesSection() {
  return (
    <section className="relative overflow-hidden bg-[#111113] py-24 text-white">
      {/* Subtle top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-amber-500/[0.02] blur-[120px]" />

      <AppContainer>
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="mx-auto mb-4 h-px w-12 bg-gradient-to-r from-amber-400/60 via-amber-400 to-amber-500/40" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            Tous les lieux où l&apos;expérience compte
          </h2>
          <p className="mt-3 text-sm text-white/40">
            Explorez par catégorie et trouvez exactement ce que vous cherchez
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {items.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="group relative flex flex-col items-center gap-3 rounded-xl border border-white/[0.05] bg-[#161618]/60 p-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-amber-400/20 hover:bg-[#161618] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/[0.03] md:p-6"
            >
              <div className="flex size-12 items-center justify-center rounded-lg border border-amber-400/10 bg-amber-400/[0.03] transition-all duration-300 group-hover:scale-110 group-hover:border-amber-400/25 group-hover:bg-amber-400/[0.06] md:size-14">
                <Icon className="size-5 text-amber-400/80 transition-colors group-hover:text-amber-400 md:size-6" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-medium leading-snug text-white/55 transition-colors group-hover:text-white/85 md:text-sm">
                {label}
              </p>
            </Link>
          ))}
        </div>

        {/* See all */}
        <div className="mt-12 text-center">
          <Link
            href="/explorer"
            className="group inline-flex items-center gap-2 text-sm font-medium text-amber-400/70 transition-colors hover:text-amber-400"
          >
            Explorer toutes les catégories
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </AppContainer>
    </section>
  );
}
