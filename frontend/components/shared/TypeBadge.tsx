import { Badge } from '@/components/ui/badge';

type SupportedType = 'CAFE' | 'RESTAURANT' | 'HOTEL' | 'CINEMA' | 'EVENT' | 'EVENT_SPACE';

const LABELS: Record<SupportedType, string> = {
  CAFE: 'Café',
  RESTAURANT: 'Restaurant',
  HOTEL: 'Hôtel',
  CINEMA: 'Cinéma',
  EVENT: 'Événement',
  EVENT_SPACE: 'Événements',
};

const COLORS: Record<SupportedType, string> = {
  CAFE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  RESTAURANT: 'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  HOTEL: 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  CINEMA: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  EVENT: 'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200',
  EVENT_SPACE: 'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200',
};

interface TypeBadgeProps {
  type: string | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
}

export function TypeBadge({ type, size = 'sm', className }: TypeBadgeProps) {
  const key = (type || 'EVENT_SPACE').toUpperCase() as SupportedType;
  const label = LABELS[key] ?? type ?? 'Autre';
  const color = COLORS[key] ?? 'bg-muted text-muted-foreground';

  return (
    <Badge
      variant="secondary"
      className={[
        'border-none font-medium',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        color,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </Badge>
  );
}

