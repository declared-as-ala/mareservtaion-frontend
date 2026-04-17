'use client';

import { Building2 } from 'lucide-react';
import { CategoryListingPage } from '@/components/shared/CategoryListingPage';

export default function HotelsPage() {
  return (
    <CategoryListingPage
      title="Hôtels"
      subtitle="Découvrez les hôtels et réservez votre chambre en Tunisie."
      mode="venue"
      venueType="HOTEL"
      emptyIcon={<Building2 className="size-12" />}
      emptyTitle="Aucun hôtel pour le moment"
      emptyDescription="Revenez bientôt pour découvrir nos hôtels partenaires."
    />
  );
}
