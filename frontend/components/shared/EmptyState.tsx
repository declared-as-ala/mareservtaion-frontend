import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-[#666666] [&_svg]:size-12">{icon}</div>}
      <h3 className="font-semibold text-[#111111]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-[#666666]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
