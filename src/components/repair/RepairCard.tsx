
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RepairGuide } from '@/lib/repair-data';

interface RepairCardProps {
  guide: RepairGuide;
}

export default function RepairCard({ guide }: RepairCardProps) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-rose-100 text-rose-700 border-rose-200',
  }[guide.difficulty];

  return (
    <Link href={`/guides/${guide.id}`}>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={guide.thumbnail}
            alt={guide.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            data-ai-hint="gadget repair"
          />
          <Badge className={`absolute top-4 left-4 ${difficultyColor} font-medium border`}>
            {guide.difficulty === 'easy' ? 'Madali' : guide.difficulty === 'medium' ? 'Katamtaman' : 'Mahirap'}
          </Badge>
        </div>
        <CardContent className="p-5 flex-grow">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{guide.category}</p>
          <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors mb-2">
            {guide.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {guide.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.timeEstimate}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {guide.rating} ({guide.reviewsCount})
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 border-t bg-slate-50/50">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {guide.device}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
