import { AppContainer } from '@/components/shared/AppContainer';
import { Coffee, Wine, Utensils, Music2, Building2, Hotel, Waves, Flower2 } from 'lucide-react';
import Link from 'next/link';

const items = [
  { icon: Coffee, label: 'Cafés & Lounges', href: '/explorer?type=CAFE' },
  { icon: Wine, label: 'Bars & Rooftops', href: '/explorer?q=Bar' },
  { icon: Utensils, label: 'Restaurants Gastronomiques', href: '/explorer?type=RESTAURANT' },
  { icon: Music2, label: 'Clubs & Resto de Nuit', href: '/explorer?q=Club' },
  { icon: Building2, label: 'Salles Privées & Événementiel', href: '/explorer?type=EVENT_SPACE' },
  { icon: Hotel, label: 'Hôtels & Resorts', href: '/explorer?type=HOTEL' },
  { icon: Waves, label: 'Beach Clubs', href: '/explorer?q=Beach' },
  { icon: Flower2, label: 'Spas & Bien-être', href: '/explorer?q=Spa' },
];

export function ExperienceCategoriesSection() {
  return (
    <section className="bg-[#060708] py-16 text-center text-amber-50">
      <AppContainer>
        <h2 className="font-serif text-2xl italic text-amber-100 md:text-3xl">
          Tous les lieux où l&apos;expérience compte
        </h2>
        <div className="mx-auto mt-3 h-px w-16 bg-amber-500/60" />

        <div className="mt-10 flex flex-wrap items-start justify-center gap-x-10 gap-y-8">
          {items.map(({ icon: Icon, label, href }) => (
            <Link 
              key={label} 
              href={href}
              className="group flex w-[120px] flex-col items-center gap-3 transition-all duration-300"
            >
              <div className="flex size-14 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-amber-500/25 group-hover:border-amber-500/60 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Icon className="size-6 text-amber-400 transition-colors group-hover:text-amber-300" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-medium leading-snug text-amber-100/90 transition-colors group-hover:text-amber-50">{label}</p>
            </Link>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
