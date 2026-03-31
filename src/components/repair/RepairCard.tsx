import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, AlertCircle, PlayCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RepairGuide } from '@/lib/repair-data';

interface RepairCardProps {
  guide: RepairGuide;
}

export default function RepairCard({ guide }: RepairCardProps) {
  const difficultyColor = {
    easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    medium: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    hard: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  }[guide.difficulty];

  return (
    <Link href={`/guides/${guide.id}`}>
      <Card className="group glass-card overflow-hidden rounded-[3rem] h-full flex flex-col transition-all duration-700 hover:-translate-y-2 border-white/5">
        <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[2.5rem]">
          <Image
            src={guide.thumbnail}
            alt={guide.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            data-ai-hint="gadget hardware"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="w-20 h-20 text-white/50 group-hover:text-primary transition-colors duration-500" />
          </div>
          <Badge className={`absolute top-6 left-6 ${difficultyColor} font-black uppercase tracking-[0.1em] text-[10px] border px-4 py-2 rounded-full backdrop-blur-xl`}>
            {guide.difficulty === 'easy' ? 'Level: Novice' : guide.difficulty === 'medium' ? 'Level: Advanced' : 'Level: Expert'}
          </Badge>
        </div>
        
        <CardContent className="p-10 pt-4 flex-grow">
          <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.25em] text-[10px] mb-6">
            <span className="w-3 h-3 rounded-full bg-primary neon-glow animate-pulse" />
            {guide.category}
          </div>
          
          <h3 className="text-3xl font-black leading-tight group-hover:text-primary transition-colors mb-4 tracking-tighter">
            {guide.title}
          </h3>
          
          <p className="text-muted-foreground text-base line-clamp-2 mb-10 leading-relaxed font-medium">
            {guide.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-black glass px-5 py-2.5 rounded-2xl border-white/10">
              <Clock className="w-5 h-5 text-primary" />
              {guide.timeEstimate.toUpperCase()}
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
              <Star className="w-5 h-5 fill-amber-400" />
              {guide.rating}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-10 py-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {guide.device}
          </span>
          <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary group-hover:translate-x-2 transition-all" />
        </CardFooter>
      </Card>
    </Link>
  );
}
