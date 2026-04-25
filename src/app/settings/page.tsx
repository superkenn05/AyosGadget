'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor, Shield, User, Globe, Info, LogOut, Check, Database, Loader2, CloudSync, Zap } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { ingestTopGuides, type SyncProgress } from '@/services/sync-service';
import { Progress } from '@/components/ui/progress';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState('appearance');

  // Sync State
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    total: 0,
    current: 0,
    status: 'idle',
    message: ''
  });

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleFullSync = async () => {
    if (!db || !user) return;
    await ingestTopGuides(db, 5, (p) => setSyncProgress(p));
  };

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'fil', label: 'Filipino' },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 pt-12 md:pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase pt-8">{t('settings_title')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-4 space-y-2">
              {[
                { id: 'appearance', label: t('settings_appearance'), icon: Sun },
                { id: 'language', label: t('settings_language'), icon: Globe },
                { id: 'data', label: 'Data Protocols', icon: Database },
                { id: 'account', label: t('settings_account'), icon: User },
                { id: 'security', label: t('settings_security'), icon: Shield },
                { id: 'about', label: t('settings_about'), icon: Info },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full justify-start h-14 rounded-2xl gap-4 font-bold ${activeTab === item.id ? 'neon-glow' : 'hover:bg-muted'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
              
              {user && (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start h-14 rounded-2xl gap-4 font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <LogOut className="w-5 h-5" />
                  {t('settings_terminate')}
                </Button>
              )}
            </div>

            {/* Content Area */}
            <div className="md:col-span-8 space-y-8">
              {activeTab === 'appearance' && (
                <Card className="glass border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-black/5 dark:border-white/5">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Sun className="w-6 h-6 text-primary" />
                      {t('settings_appearance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <section>
                      <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Neural Theme Engine</p>
                      <div className="grid grid-cols-3 gap-4">
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border-2 ${
                              theme === t.id 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-black/5 dark:border-white/5 bg-muted/30 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20'
                            }`}
                          >
                            <t.icon className="w-8 h-8" />
                            <span className="text-xs font-bold uppercase tracking-tighter">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'language' && (
                <Card className="glass border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-black/5 dark:border-white/5">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Globe className="w-6 h-6 text-primary" />
                      {t('settings_language')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">System Localization</p>
                    <div className="space-y-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setLanguage(lang.id)}
                          className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2 ${
                            language === lang.id 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-black/5 dark:border-white/5 bg-muted/30 dark:bg-white/5'
                          }`}
                        >
                          <span className="font-bold">{lang.label}</span>
                          {language === lang.id && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'data' && (
                <Card className="glass border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-black/5 dark:border-white/5">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Database className="w-6 h-6 text-primary" />
                      Data Ingestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <h4 className="font-black uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                        <CloudSync className="w-4 h-4 text-primary" />
                        Full Library Ingestion
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium mb-6">
                        I-synchronize ang pinakabagong 100+ repair protocols mula sa iFixit library papunta sa iyong Firestore Vault. Ginagarantiyahan nito ang mabilis na access kahit walang internet.
                      </p>

                      {syncProgress.status !== 'idle' && (
                        <div className="space-y-4 mb-6">
                           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-primary">{syncProgress.message}</span>
                              <span className="opacity-50">{syncProgress.current} / {syncProgress.total}</span>
                           </div>
                           <Progress value={(syncProgress.current / syncProgress.total) * 100} className="h-2" />
                        </div>
                      )}

                      <Button 
                        onClick={handleFullSync} 
                        disabled={syncProgress.status === 'syncing' || !user}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 neon-glow"
                      >
                        {syncProgress.status === 'syncing' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        {syncProgress.status === 'syncing' ? 'Syncing Protocols...' : 'Initiate Full Ingestion'}
                      </Button>
                      {!user && <p className="text-[9px] text-center mt-3 text-rose-500 font-bold uppercase tracking-widest">Authentication Required to Write to Vault</p>}
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">System Stats</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 glass rounded-2xl border-black/5">
                             <span className="text-[8px] font-black uppercase opacity-50 block">Status</span>
                             <span className="text-xs font-bold text-emerald-500 uppercase">Synchronized</span>
                          </div>
                          <div className="p-4 glass rounded-2xl border-black/5">
                             <span className="text-[8px] font-black uppercase opacity-50 block">Provider</span>
                             <span className="text-xs font-bold uppercase">iFixit v2.0</span>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="p-8 glass rounded-[2.5rem] border-black/5 dark:border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-black text-lg tracking-tight uppercase">{t('settings_version')}</p>
                  <p className="text-sm text-muted-foreground font-bold">AyosGadget Engine v4.2.1-stable</p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold border-black/10 dark:border-white/10">{t('settings_check_updates')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
