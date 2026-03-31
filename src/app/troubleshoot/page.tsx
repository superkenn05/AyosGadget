import TroubleshootingChat from '@/components/ai/TroubleshootingChat';
import { HelpCircle, Info, Sparkles } from 'lucide-react';

export default function TroubleshootPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto mb-12 text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered Assistant
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Interactive Troubleshooter</h1>
          <p className="text-xl text-muted-foreground">
            Tulungan kaming matukoy ang problema ng iyong gadget sa pamamagitan ng pakikipag-chat sa aming Ayos AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <TroubleshootingChat />
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 bg-white dark:bg-card rounded-3xl shadow-sm border border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <Info className="w-6 h-6" />
                <h2 className="text-xl font-bold">Paano ito gamitin?</h2>
              </div>
              <ol className="space-y-6">
                {[
                  { title: 'Ilarawan ang device', desc: 'Sabihin kung smartphone, laptop, o appliance ang may sira.' },
                  { title: 'Ipaliwanag ang sira', desc: 'Anong nangyayari? Ayaw bang bumukas? Basag ba ang screen?' },
                  { title: 'Sundin ang Ayos AI', desc: 'Sasagutin ka ng AI ng mga posibleng solusyon o karagdagang tanong.' },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 flex items-center justify-center font-bold text-sm text-slate-500">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold mb-1">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-8 bg-secondary/10 rounded-3xl border border-secondary/20">
              <div className="flex items-center gap-3 mb-4 text-secondary-foreground">
                <HelpCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Bakit AI?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Ginagamit namin ang pinaka-modernong AI model para mas mabilis mong mahanap ang tamang repair guide at makatipid sa oras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
