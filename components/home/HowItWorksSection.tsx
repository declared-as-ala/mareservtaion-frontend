import Image from 'next/image';
import { AppContainer } from '@/components/shared/AppContainer';

const steps = [
  {
    number: '1',
    title: 'Explorez le lieu',
    text: 'Visite virtuelle immersive pour découvrir chaque espace avant de réserver.',
    image:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80&auto=format&fit=crop',
  },
  {
    number: '2',
    title: 'Choisissez votre espace',
    text: 'Table, VIP, terrasse — sélectionnez l\'emplacement qui vous convient.',
    image:
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200&q=80&auto=format&fit=crop',
  },
  {
    number: '3',
    title: 'Réservez et payez',
    text: 'Paiement sécurisé en ligne, confirmation instantanée.',
    image:
      'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=1200&q=80&auto=format&fit=crop',
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-[#070809] py-16 text-amber-50">
      <AppContainer>
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl italic text-amber-100 md:text-3xl">
            Comment ça marche
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-amber-500/60" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group overflow-hidden rounded-xl border border-amber-500/15 bg-[#0c0d0e]"
            >
              <div className="relative h-44 overflow-hidden">
                <Image src={step.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-black/30 to-transparent" />
                <span className="absolute bottom-3 left-4 font-serif text-5xl font-bold text-amber-400/80">
                  {step.number}
                </span>
              </div>
              <div className="px-5 pb-6 pt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-amber-100/70">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
