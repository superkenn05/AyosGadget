'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function RepairCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'trouble' }) {
  if (variant === 'compact') {
    return (
      <div className="glass rounded-2xl overflow-hidden flex items-center h-24 p-4 gap-4">
        <div className="flex-grow space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-32 h-full rounded-xl shrink-0" />
      </div>
    );
  }

  if (variant === 'trouble') {
    return (
      <div className="glass rounded-2xl overflow-hidden flex flex-col aspect-[4/5]">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 flex justify-center">
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden rounded-3xl flex flex-col h-full">
      <Skeleton className="aspect-[21/10] w-full" />
      <div className="p-6 md:p-8 space-y-4 flex-grow">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="px-6 pb-6 md:px-8 md:pb-8 flex justify-end">
        <Skeleton className="w-12 h-12 rounded-2xl" />
      </div>
    </div>
  );
}
