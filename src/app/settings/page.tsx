'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor, Bell, Shield, User, Globe, Info, LogOut, Check } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useUser();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');

  const handleLogout = async () => {
    await signOut(auth);
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
                { id: 'account', label: t('settings_account'), icon: User },
                { id: 'security', label: 'Security', icon: Shield },
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

              <div className="p-8 glass rounded-[2.5rem] border-black/5 dark:border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-black text-lg tracking-tight uppercase">Software Version</p>
                  <p className="text-sm text-muted-foreground font-bold">AyosGadget Engine v4.2.1-stable</p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold border-black/10 dark:border-white/10">Check Updates</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
