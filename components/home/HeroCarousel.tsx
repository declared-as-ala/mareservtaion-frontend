'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchBannerSlides } from '@/lib/api/bannerSlides';
import type { BannerSlide } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

function SlideContent({
  slide,
  isMobile,
}: {
  slide: BannerSlide;
  isMobile: boolean;
}) {
  const img = isMobile && slide.imageUrlMobile ? slide.imageUrlMobile : slide.imageUrlDesktop;
  const title = slide.titleFr ?? '';
  const subtitle = slide.subtitleFr;
  const ctaLabel = slide.ctaLabelFr ?? 'Réserver';
  const ctaUrl = slide.ctaUrl ?? '/explorer';

  return (
    <div className="relative flex min-h-[500px] w-full flex-col justify-end overflow-hidden bg-black md:min-h-[620px]">
      <Image
        src={img || FALLBACK_IMAGE}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 max-w-2xl p-8 md:p-16 lg:p-20">
        <h2 className="font-serif text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-lg text-base text-white/80 md:text-lg">
            {subtitle}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={ctaUrl}
            className="inline-flex items-center rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
          >
            {ctaLabel}
          </Link>
          <Link
            href="/explorer"
            className="inline-flex items-center rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
          >
            Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}

function FallbackHero() {
  const { user } = useAuthStore();
  return (
    <div className="relative flex min-h-[500px] w-full flex-col justify-end overflow-hidden bg-black md:min-h-[620px]">
      <Image
        src={FALLBACK_IMAGE}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 max-w-2xl p-8 md:p-16 lg:p-20">
        <h2 className="font-serif text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          Réservez votre table et votre expérience avant d&apos;y aller
        </h2>
        <p className="mt-3 max-w-lg text-base text-white/80 md:text-lg">
          Réservez votre table, chambre ou place en quelques clics.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/explorer"
            className="inline-flex items-center rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Explorer les lieux
          </Link>
          <Link
            href={user ? '/dashboard' : '/login'}
            className="inline-flex items-center rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
          >
            {user ? 'Tableau de bord' : 'Connexion'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);

  const { data: slides = [] } = useQuery({
    queryKey: ['banner-slides'],
    queryFn: fetchBannerSlides,
  });

  const updateIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateIndex();
    emblaApi.on('select', updateIndex);
  }, [emblaApi, updateIndex]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1 || paused) return;
    const t = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(t);
  }, [emblaApi, slides.length, paused]);

  if (!mounted) {
    return <FallbackHero />;
  }

  if (slides.length === 0) {
    return <FallbackHero />;
  }

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide._id} className="min-w-0 flex-[0_0_100%]">
              <SlideContent slide={slide} isMobile={isMobile} />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all',
              i === selectedIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/70'
            )}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Précédent"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Suivant"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
