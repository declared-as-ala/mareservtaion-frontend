'use client';

import { UtensilsCrossed } from 'lucide-react';
import { CategoryListingPage } from '@/components/shared/CategoryListingPage';

export default function RestaurantsPage() {
  return (
    <CategoryListingPage
      title="Restaurants"
      subtitle="Découvrez les meilleurs restaurants gastronomiques en Tunisie."
      mode="venue"
      venueType="RESTAURANT"
      emptyIcon={<UtensilsCrossed className="size-12" />}
      emptyTitle="Aucun restaurant pour le moment"
      emptyDescription="Revenez bientôt pour découvrir nos restaurants partenaires."
    />
  );
}
