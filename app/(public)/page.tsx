import { HeroSliderSection } from '@/components/home/HeroSliderSection';
import { ExperienceCategoriesSection } from '@/components/home/ExperienceCategoriesSection';
import { FeaturedVenuesSection } from '@/components/home/FeaturedVenuesSection';
import { SponsoredVenuesSection } from '@/components/home/SponsoredVenuesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { WorldPresenceSection } from '@/components/home/WorldPresenceSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-amber-50">
      <HeroSliderSection />
      <ExperienceCategoriesSection />
      <FeaturedVenuesSection />
      <SponsoredVenuesSection />
      <HowItWorksSection />
      <WorldPresenceSection />
    </div>
  );
}
