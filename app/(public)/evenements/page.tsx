'use client';

import { Calendar } from 'lucide-react';
import { CategoryListingPage } from '@/components/shared/CategoryListingPage';

export default function EvenementsPage() {
  return (
    <CategoryListingPage
      title="Événements"
      subtitle="Concerts, soirées et événements à ne pas manquer."
      mode="event"
      emptyIcon={<Calendar className="size-12" />}
      emptyTitle="Aucun événement à venir"
      emptyDescription="Revenez bientôt pour découvrir les prochains événements."
    />
  );
}
