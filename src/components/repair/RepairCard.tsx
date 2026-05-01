import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ShieldCheck, ArrowRight, Zap, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/providers/language-provider';
import { cn } from '@/lib/utils';

interface RepairCardProps {
  guide: any;
  variant?: 'default' | 'compact' | 'trouble';
}

export default function RepairCard({ guide, variant = 'default' }: RepairCardProps) {
  const { t } = useLanguage();
  
  const difficultyLabel = t(`guides_difficulty_${guide.difficulty}`);
  const difficultyColor = {
    easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/20',
    hard: 'text-rose-600 dark:text-rose-400 bg-rose-500/20',
  }[guide.difficulty as 'easy' | 'medium' | 'hard'] || 'bg-muted';

  // Fallback image if thumbnail is missing to prevent NextJS Image error
  const thumbnailSrc = guide.thumbnail || 'https://picsum.photos/seed/repair/800/600';

  if (variant === 'compact') {
    return (
      <Link href={`/guides/${guide.id}`}>
        <div className="glass group rounded-2xl overflow-hidden flex items-center h-24 transition-all hover:border-primary/50 active:scale-95">
          <div className="p-4 flex-grow min-w-0">
             <h4 className="text-xs md:text-sm font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
               {guide.title}
             </h4>
             <div className="flex items-center gap-2 mt-1">
               <span className={`text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${difficultyColor}`}>
                 {difficultyLabel}
               </span>
               <span className="text-[6px] font-black uppercase tracking-widest text-muted-foreground">
                 {guide.timeEstimate}
               </span>
             </div>
          </div>
          <div className="relative w-32 h-full shrink-0 border-l border-black/5 dark:border-white/5">
            <Image
              src={thumbnailSrc}
              alt={guide.title}
              fill
              sizes="128px"
              className="object-cover transition-transform group-hover:scale-110"
              data-ai-hint="repair gadget"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'trouble') {
    return (
      <Link href={`/guides/${guide.id}`}>
        <div className="glass group rounded-2xl overflow-hidden flex flex-col transition-all hover:border-amber-500/50 active:scale-95 bg-amber-500/[0.02]">
          <div className="relative aspect-square">
            <Image
              src={thumbnailSrc}
              alt={guide.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              data-ai-hint="broken device"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-amber-500 text-white text-[7px] font-black uppercase tracking-widest shadow-lg">
              FAULTS DETECTED
            </div>
          </div>
          <div className="p-4 text-center">
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-tight leading-tight group-hover:text-amber-500 transition-colors line-clamp-2">
              {guide.title}
            </h4>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/guides/${guide.id}`}>
      <div className="glass-card group overflow-hidden rounded-3xl flex flex-col h-full relative">
        <div className="absolute inset-0 scan-line opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="relative aspect-[21/10] overflow-hidden">
          <Image
            src={thumbnailSrc}
            alt={guide.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="electronics repair"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <Badge className={`absolute top-4 right-4 ${difficultyColor} font-black uppercase tracking-[0.2em] text-[7px] border-none px-3 py-1 rounded-full backdrop-blur-md shadow-sm`}>
            {difficultyLabel}
          </Badge>
          
          <div className="absolute bottom-4 left-6 flex items-center gap-1 text-[8px] font-black text-primary uppercase tracking-widest bg-primary/20 backdrop-blur-md px-2 py-1 rounded-lg border border-primary/30">
            <Zap className="w-3 h-3" />
            {t('card_priority_task')}
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
              {guide.device || 'Hardware'}
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
