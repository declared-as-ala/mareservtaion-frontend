import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const skeletonBase = 'bg-gray-200 animate-shimmer';

export function VenueCardSkeleton() {
  return (
    <Card className="overflow-hidden border-gray-200 bg-white">
      <Skeleton className={`${skeletonBase} aspect-[16/10] w-full rounded-none`} />
      <CardHeader className="space-y-2 pb-2">
        <Skeleton className={`${skeletonBase} h-5 w-3/4`} />
        <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <Skeleton className={`${skeletonBase} h-4 w-full`} />
        <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
      </CardContent>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden border-gray-200 bg-white">
      <Skeleton className={`${skeletonBase} aspect-[16/10] w-full rounded-none`} />
      <CardHeader className="space-y-2 pb-2">
        <Skeleton className={`${skeletonBase} h-5 w-2/3`} />
        <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className={`${skeletonBase} h-4 w-full`} />
      </CardContent>
    </Card>
  );
}

export function ReservationCardSkeleton() {
  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Skeleton className={`${skeletonBase} h-16 w-24 rounded-md`} />
        <div className="flex-1 space-y-2">
          <Skeleton className={`${skeletonBase} h-5 w-48`} />
          <Skeleton className={`${skeletonBase} h-4 w-32`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className={`${skeletonBase} h-4 w-full`} />
        <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
      </CardContent>
    </Card>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className={`${skeletonBase} aspect-[21/9] w-full rounded-xl`} />
      <div className="space-y-2">
        <Skeleton className={`${skeletonBase} h-9 w-2/3`} />
        <Skeleton className={`${skeletonBase} h-5 w-1/3`} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className={`${skeletonBase} h-32 rounded-lg`} />
        <Skeleton className={`${skeletonBase} h-32 rounded-lg`} />
        <Skeleton className={`${skeletonBase} h-32 rounded-lg`} />
      </div>
      <Skeleton className={`${skeletonBase} h-48 w-full rounded-lg`} />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className={`${skeletonBase} h-5 w-full`} />
        </td>
      ))}
    </tr>
  );
}

/** For section carousel rails on home */
export function CarouselRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[85%] flex-shrink-0 sm:min-w-[45%] lg:min-w-[30%]">
          <VenueCardSkeleton />
        </div>
      ))}
    </div>
  );
}
