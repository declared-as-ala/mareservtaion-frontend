'use client';

import Link from 'next/link';
import { Bed } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface RoomCardData {
  _id: string;
  roomNumber?: number;
  roomType?: string;
  capacity?: number;
  pricePerNight?: number;
  venueId?: string | { _id: string; name: string; city?: string };
  venueName?: string;
}

interface RoomCardProps {
  room: RoomCardData;
  venueSlugOrId?: string;
  className?: string;
}

export function RoomCard({ room, venueSlugOrId, className }: RoomCardProps) {
  const href = venueSlugOrId ? `/lieu/${venueSlugOrId}` : '#';
  const venueName =
    room.venueName ?? (typeof room.venueId === 'object' ? room.venueId?.name : undefined);

  return (
    <Link href={href} className={cn('block transition-shadow hover:shadow-md', className)}>
      <Card className="h-full overflow-hidden">
        <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Bed className="size-12" />
          </div>
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-semibold">
            Chambre {room.roomNumber ?? room._id}
            {room.roomType ? ` — ${room.roomType}` : ''}
          </h3>
          {venueName && <p className="text-sm text-muted-foreground">{venueName}</p>}
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-2">
            {room.capacity != null && (
              <Badge variant="secondary">Jusqu&apos;à {room.capacity} pers.</Badge>
            )}
            {room.pricePerNight != null && (
              <span className="text-sm font-medium">{room.pricePerNight} TND / nuit</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-sm text-primary">
          Voir le lieu →
        </CardFooter>
      </Card>
    </Link>
  );
}
