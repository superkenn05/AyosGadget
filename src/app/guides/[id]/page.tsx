
import Navbar from '@/components/layout/Navbar';
import { FEATURED_REPAIRS } from '@/lib/repair-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Wrench, Package, ArrowLeft, Star, MessageCircle, Share2, Bookmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function GuideDetailPage({ params }: { params: { id: string } }) {
  const guide = FEATURED_REPAIRS.find((g) => g.id === params.id) || FEATURED_REPAIRS[0];

  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-rose-100 text-rose-700',
  }[guide.difficulty];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2 rounded-xl text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Bumalik sa Home
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="secondary" className="rounded-lg">{guide.category}</Badge>
                <Badge className={`rounded-lg ${difficultyColor} border-none`}>
                  {guide.difficulty === 'easy' ? 'Madali' : guide.difficulty === 'medium' ? 'Katamtaman' : 'Mahirap'}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-medium text-amber-500 ml-auto">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {guide.rating} ({guide.reviewsCount} reviews)
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{guide.title}</h1>
              
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 shadow-xl">
                <Image
                  src={guide.thumbnail}
                  alt={guide.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm mb-12">
                <h3 className="text-xl font-bold mb-4">Mungkahing Oras: {guide.timeEstimate}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {guide.description}
                </p>
              </div>

              <h2 className="text-3xl font-bold mb-8">Step-by-Step Instructions</h2>
              <div className="space-y-12">
                {guide.steps.map((step, index) => (
                  <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {index + 1}
                        </div>
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={step.imageUrl}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1 rounded-2xl h-14 font-bold text-lg gap-2 shadow-lg shadow-primary/20">
                <Bookmark className="w-5 h-5" />
                I-save Gabay
              </Button>
              <Button variant="outline" size="icon" className="rounded-2xl h-14 w-14 shrink-0 border-2">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Tools Required */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
              <div className="p-6 bg-slate-50 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg">Mga Kailangang Tools</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {guide.tools.map((tool, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {tool.name}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full mt-6 rounded-xl font-bold">Bumili ng Repair Kit</Button>
              </div>
            </Card>

            {/* Parts Required */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
              <div className="p-6 bg-slate-50 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary-foreground">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg">Parts na Kailangan</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {guide.parts.map((part, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-medium">{part.name}</span>
                      <span className="text-primary font-bold">{part.price}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6 rounded-xl font-bold">Mag-order ng Parts</Button>
              </div>
            </Card>

            {/* FAQ/Community help */}
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-bold text-lg">Kailangan ng tulong?</h3>
              </div>
              <p className="text-sm text-primary/80 mb-6 font-medium">
                Kung hirap sa tutorial, pwedeng magtanong sa aming community forum o gamitin ang AI Troubleshooter.
              </p>
              <Link href="/troubleshoot">
                <Button className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20">Ask Ayos AI</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local helper card
function Card({ children, className }: any) {
  return <div className={`border rounded-xl bg-card text-card-foreground ${className}`}>{children}</div>
}
