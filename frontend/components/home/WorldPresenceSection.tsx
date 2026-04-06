import Image from 'next/image';
import { AppContainer } from '@/components/shared/AppContainer';

export function WorldPresenceSection() {
  return (
    <section className="relative min-h-[420px] overflow-hidden bg-black py-20 text-amber-50 md:min-h-[500px]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80&auto=format&fit=crop"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-amber-600/5" />
      </div>

      <AppContainer>
        <div className="relative z-10 flex min-h-[340px] flex-col items-center justify-center text-center md:min-h-[400px]">
          <h2 className="mx-auto max-w-3xl font-serif text-2xl leading-relaxed text-amber-100/90 md:text-3xl lg:text-4xl">
            La plateforme de réservation immersive présente{' '}
            <strong className="font-bold text-amber-300">bientôt</strong>{' '}
            dans le monde entier
          </h2>
          <div className="mx-auto mt-4 h-px w-20 bg-amber-500/40" />
        </div>
      </AppContainer>
    </section>
  );
}
