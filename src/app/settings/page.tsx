'use client';

import Navbar from '@/components/layout/Navbar';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor, Bell, Shield, User, Globe, Info } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase">System Config</h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-4 space-y-2">
              {[
                { label: 'Appearance', icon: Sun, active: true },
                { label: 'Account', icon: User },
                { label: 'Notifications', icon: Bell },
                { label: 'Security', icon: Shield },
                { label: 'Language', icon: Globe },
                { label: 'About', icon: Info },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start h-14 rounded-2xl gap-4 font-bold ${item.active ? 'neon-glow' : 'hover:bg-muted'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-8 space-y-8">
              <Card className="glass border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-black/5 dark:border-white/5">
                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Sun className="w-6 h-6 text-primary" />
                    Appearance
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

                  <section className="pt-8 border-t border-black/5 dark:border-white/5">
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Interface Feedback</p>
                    <div className="space-y-4">
                      {[
                        { label: 'Neural Glow Effects', active: true },
                        { label: 'Background Scanning Lines', active: true },
                        { label: 'High-Contrast Typography', active: false },
                      ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between p-4 glass rounded-2xl">
                          <span className="font-bold text-sm">{pref.label}</span>
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${pref.active ? 'bg-primary' : 'bg-muted'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${pref.active ? 'left-7' : 'left-1'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </CardContent>
              </Card>

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