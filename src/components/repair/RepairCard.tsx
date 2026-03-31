import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RepairGuide } from '@/lib/repair-data';

interface RepairCardProps {
  guide: RepairGuide;
}

export default function RepairCard({ guide }: RepairCardProps) {
  const difficultyColor = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[guide.difficulty];

  return (
    <Link href={`/guides/${guide.id}`}>
      <Card className="group glass-card overflow-hidden border-white/5 rounded-[2.5rem] h-full flex flex-col transition-all duration-500 hover:ring-2 hover:ring-primary/50">
        <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[1.8rem]">
          <Image
            src={guide.thumbnail}
            alt={guide.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint="gadget repair"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl" />
          </div>
          <Badge className={`absolute top-4 left-4 ${difficultyColor} font-bold border-none backdrop-blur-md px-4 py-1.5 rounded-xl`}>
            {guide.difficulty === 'easy' ? 'Madali' : guide.difficulty === 'medium' ? 'Katamtaman' : 'Mahirap'}
          </Badge>
        </div>
        <CardContent className="p-8 pt-4 flex-grow">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">
            <span className="w-2 h-2 rounded-full bg-primary neon-glow" />
            {guide.category}
          </div>
          <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors mb-4 line-clamp-1">
            {guide.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 mb-8 leading-relaxed font-medium">
            {guide.description}
          </p>
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-2 text-muted-foreground glass px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-primary" />
              {guide.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 glass px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 fill-amber-400" />
              {guide.rating}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-8 py-6 border-t border-white/5 bg-white/[0.02]">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Compatible with {guide.device}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
