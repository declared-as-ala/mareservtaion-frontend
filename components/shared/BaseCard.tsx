import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface BaseCardProps extends React.ComponentProps<'div'> {
  hoverable?: boolean;
  children?: React.ReactNode;
}

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, hoverable = true, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'rounded-xl border border-border/50 bg-card/95 shadow-sm',
          hoverable &&
            'transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

BaseCard.displayName = 'BaseCard';
