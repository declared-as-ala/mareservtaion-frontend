import { HeroSliderSection } from '@/components/home/HeroSliderSection';
import { ExperienceCategoriesSection } from '@/components/home/ExperienceCategoriesSection';
import { VedetteByCategorySection } from '@/components/home/VedetteByCategorySection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { WorldPresenceSection } from '@/components/home/WorldPresenceSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <HeroSliderSection />
      <ExperienceCategoriesSection />
      <VedetteByCategorySection />
      <HowItWorksSection />
      <WorldPresenceSection />
    </div>
  );
}
