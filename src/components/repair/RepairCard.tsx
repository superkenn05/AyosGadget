import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RepairGuide } from '@/lib/repair-data';
import { useLanguage } from '@/components/providers/language-provider';

interface RepairCardProps {
  guide: RepairGuide;
}

export default function RepairCard({ guide }: RepairCardProps) {
  const { t } = useLanguage();
  
  const difficultyLabel = t(`guides_difficulty_${guide.difficulty}`);
  const difficultyColor = {
    easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/20',
    hard: 'text-rose-600 dark:text-rose-400 bg-rose-500/20',
  }[guide.difficulty];

  return (
    <Link href={`/guides/${guide.id}`}>
      <div className="glass-card group overflow-hidden rounded-[2.5rem] flex flex-col h-full relative">
        <div className="absolute inset-0 scan-line opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="relative aspect-[21/10] overflow-hidden">
          <Image
            src={guide.thumbnail}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="gadget repair"
          />
          {/* Always dark gradient for text readability on images */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <Badge className={`absolute top-4 right-4 ${difficultyColor} font-black uppercase tracking-[0.2em] text-[7px] border-none px-3 py-1 rounded-full backdrop-blur-md shadow-sm`}>
            {difficultyLabel}
          </Badge>
          
          <div className="absolute bottom-4 left-6 flex items-center gap-1 text-[8px] font-black text-primary uppercase tracking-widest bg-primary/20 backdrop-blur-md px-2 py-1 rounded-lg border border-primary/30">
            <Zap className="w-3 h-3" />
            Priority Task
          </div>
        </div>
        
        <div className="p-6 md:p-8 flex flex-col gap-4 flex-grow relative bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{guide.category}</span>
            <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-black text-[10px] tracking-tighter">
              <Star className="w-3 h-3 fill-current" />
              {guide.rating}
            </div>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black leading-tight tracking-tighter text-foreground group-hover:text-primary transition-colors">
            {guide.title}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-primary/50" />
              {guide.timeEstimate}
            </div>
            <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-primary/50" />
              {guide.device}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 md:px-8 md:pb-8 flex justify-end bg-card">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl glass flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-lg border-primary/10">
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>
    </Link>
  );
}
