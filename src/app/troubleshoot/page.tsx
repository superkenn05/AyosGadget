'use client';

import TroubleshootingChat from '@/components/ai/TroubleshootingChat';
import { HelpCircle, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';

export default function TroubleshootPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto mb-12 text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            {t('troubleshoot_ai_badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('troubleshoot_title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('troubleshoot_subtitle')}
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
                <h2 className="text-xl font-bold">{t('troubleshoot_how_to')}</h2>
              </div>
              <ol className="space-y-6">
                {[
                  { title: t('troubleshoot_step1_title'), desc: t('troubleshoot_step1_desc') },
                  { title: t('troubleshoot_step2_title'), desc: t('troubleshoot_step2_desc') },
                  { title: t('troubleshoot_step3_title'), desc: t('troubleshoot_step3_desc') },
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
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <HelpCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">{t('troubleshoot_why_ai')}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {t('troubleshoot_why_ai_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
