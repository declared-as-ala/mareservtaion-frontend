'use client';

import { Coffee } from 'lucide-react';
import { CategoryListingPage } from '@/components/shared/CategoryListingPage';

export default function CafesPage() {
  return (
    <CategoryListingPage
      title="Cafés"
      subtitle="Découvrez les meilleurs cafés et lounges en Tunisie."
      mode="venue"
      venueType="CAFE"
      emptyIcon={<Coffee className="size-12" />}
      emptyTitle="Aucun café pour le moment"
      emptyDescription="Revenez bientôt pour découvrir nos cafés partenaires."
    />
  );
}
