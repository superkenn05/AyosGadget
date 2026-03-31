import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ShieldCheck, ArrowRight, PlayCircle, Cpu, Activity } from 'lucide-react';
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
      <Card className="group glass-card overflow-hidden rounded-[3.5rem] h-full flex flex-col transition-all duration-700 hover:-translate-y-4 border-white/5 relative">
        {/* Technical Frame Decoration */}
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/10 rounded-tr-[1.5rem] pointer-events-none group-hover:border-primary transition-colors" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white/10 rounded-bl-[1.5rem] pointer-events-none group-hover:border-primary transition-colors" />

        <div className="relative aspect-[16/11] overflow-hidden m-6 rounded-[2.5rem] shadow-2xl">
          <Image
            src={guide.thumbnail}
            alt={guide.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            data-ai-hint="gadget hardware"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center neon-glow">
                <PlayCircle className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>
          <Badge className={`absolute top-6 left-6 ${difficultyColor} font-black uppercase tracking-[0.2em] text-[8px] border-none px-4 py-2 rounded-full backdrop-blur-xl bg-black/40`}>
            PROTO: {guide.difficulty.toUpperCase()}
          </Badge>
          
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
             <div className="w-full h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(0,242,255,0.8)] absolute animate-[scan_3s_linear_infinite]" />
          </div>
        </div>
        
        <CardContent className="p-10 pt-2 flex-grow">
          <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[9px] mb-6">
            <div className="flex gap-1">
              <span className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
              <span className="w-1.5 h-3 bg-primary/50 rounded-full animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
            {guide.category}
          </div>
          
          <h3 className="text-3xl font-black leading-tight group-hover:text-primary transition-colors mb-4 tracking-tighter">
            {guide.title}
          </h3>
          
          <p className="text-muted-foreground text-base line-clamp-2 mb-10 leading-relaxed font-medium opacity-70 group-hover:opacity-100 transition-opacity">
            {guide.description}
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest glass px-5 py-3 rounded-2xl border-white/5">
              <Clock className="w-4 h-4 text-primary" />
              {guide.timeEstimate}
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-black text-base">
              <Star className="w-4 h-4 fill-amber-400" />
              {guide.rating}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-10 py-10 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">{guide.device}</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Verified Component</span>
            </div>
          </div>
          <ArrowRight className="w-7 h-7 text-white/10 group-hover:text-primary group-hover:translate-x-2 transition-all duration-500" />
        </CardFooter>
      </Card>
    </Link>
  );
}