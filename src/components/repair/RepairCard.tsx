
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RepairGuide } from '@/lib/repair-data';

interface RepairCardProps {
  guide: RepairGuide;
}

export default function RepairCard({ guide }: RepairCardProps) {
  const difficultyColor = {
    easy: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    hard: 'text-rose-400 bg-rose-500/10',
  }[guide.difficulty];

  return (
    <Link href={`/guides/${guide.id}`}>
      <div className="glass-card group overflow-hidden rounded-[2rem] flex flex-col">
        <div className="relative aspect-[21/9] overflow-hidden">
          <Image
            src={guide.thumbnail}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="gadget repair"
          />
          <Badge className={`absolute top-4 right-4 ${difficultyColor} font-black uppercase tracking-[0.1em] text-[8px] border-none px-3 py-1 rounded-full backdrop-blur-md`}>
            {guide.difficulty}
          </Badge>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
        
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{guide.category}</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
              <Star className="w-3 h-3 fill-amber-400" />
              {guide.rating}
            </div>
          </div>
          
          <h3 className="text-lg font-black leading-tight tracking-tight">
            {guide.title}
          </h3>
          
          <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {guide.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              {guide.device}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end">
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
