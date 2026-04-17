'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchBannerSlides } from '@/lib/api/bannerSlides';
import type { BannerSlide } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

function SlideImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored ? FALLBACK_IMAGE : src;

  return (
    <div className="absolute inset-0">
      <Image
        src={finalSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        priority={priority}
        onError={() => setErrored(true)}
        quality={85}
      />
    </div>
  );
}

function SlideOverlay() {
  return (
    <>
      <div className="absolute inset-0 bg-[#0B0B0C]/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/85 via-[#0B0B0C]/55 to-[#0B0B0C]/25" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#111113]/30 to-transparent" />
    </>
  );
}

function SlideContent({
  slide,
  isMobile,
  isActive,
}: {
  slide: BannerSlide;
  isMobile: boolean;
  isActive: boolean;
}) {
  const img = isMobile && slide.imageUrlMobile ? slide.imageUrlMobile : slide.imageUrlDesktop;
  const title = slide.titleFr ?? '';
  const subtitle = slide.subtitleFr;
  const ctaLabel = slide.ctaLabelFr ?? 'Réserver';
  const ctaUrl = slide.ctaUrl ?? '/explorer';

  return (
    <div className="relative flex min-h-[600px] w-full flex-col justify-center overflow-hidden bg-[#0B0B0C] md:min-h-[720px] lg:min-h-[820px]">
      {img ? (
        <SlideImage src={img} alt={title || 'Banner'} priority={isActive} />
      ) : (
        <SlideImage src={FALLBACK_IMAGE} alt="" priority={isActive} />
      )}

      <SlideOverlay />

      {/* Decorative ambient glow */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-500/[0.03] blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-600/[0.02] blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 md:px-10">
        <div className="max-w-xl">
          <div className="mb-6 h-px w-16 bg-gradient-to-r from-amber-400/80 via-amber-400 to-amber-500/60" />

          {subtitle && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              {subtitle}
            </p>
          )}

          <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {title || 'Réservez votre expérience'}
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
            Découvrez et réservez les meilleurs lieux, restaurants, hôtels et événements — en quelques clics.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={ctaUrl}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/15 transition-all duration-300 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {ctaLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/explorer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/30 hover:bg-amber-400/[0.04]"
            >
              Explorer les lieux
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FallbackHero() {
  return (
    <div className="relative flex min-h-[600px] w-full flex-col justify-center overflow-hidden bg-[#0B0B0C] md:min-h-[720px] lg:min-h-[820px]">
      <SlideImage src={FALLBACK_IMAGE} alt="" priority />
      <SlideOverlay />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-500/[0.03] blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-600/[0.02] blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 md:px-10">
        <div className="max-w-xl">
          <div className="mb-6 h-px w-16 bg-gradient-to-r from-amber-400/80 via-amber-400 to-amber-500/60" />
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
            Ma Reservation
          </p>
          <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Réservez votre table et votre expérience avant d&apos;y aller
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
            Découvrez, explorez et réservez les meilleurs lieux et expériences.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/explorer"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/15 transition-all duration-300 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Explorer les lieux
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/30 hover:bg-amber-400/[0.04]"
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
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
    setMounted(true);
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
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
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, idx) => (
            <div key={slide._id} className="min-w-0 flex-[0_0_100%]">
              <SlideContent slide={slide} isMobile={isMobile} isActive={idx === selectedIndex} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === selectedIndex
                ? 'w-8 bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm shadow-amber-500/30'
                : 'w-2 bg-white/25 hover:bg-white/40'
            )}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B0B0C]/60 text-amber-400/70 backdrop-blur-md ring-1 ring-white/[0.06] transition-all duration-200 hover:bg-[#0B0B0C]/80 hover:text-amber-400 hover:scale-105"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Précédent"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B0B0C]/60 text-amber-400/70 backdrop-blur-md ring-1 ring-white/[0.06] transition-all duration-200 hover:bg-[#0B0B0C]/80 hover:text-amber-400 hover:scale-105"
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
