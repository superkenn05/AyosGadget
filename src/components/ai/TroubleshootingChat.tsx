"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Cpu, Terminal, Shield, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { aiTroubleshootingAssistant } from '@/ai/flows/ai-troubleshooting-assistant';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  role: 'user' | 'model';
  content: string;
  data?: any;
};

export default function TroubleshootingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'NEURAL SYSTEM INITIALIZED. UPTIME: 99.9%. READY TO DIAGNOSE HARDWARE FAULTS. PLEASE INPUT DEVICE LOGS OR DESCRIPTION.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await aiTroubleshootingAssistant({
        problemDescription: userMsg,
        conversationHistory: history,
      });

      let responseContent = response.diagnosis;
      if (response.questionsToAsk && response.questionsToAsk.length > 0) {
        responseContent += "\n\nREQUIRED TELEMETRY:\n" + response.questionsToAsk.map(q => `> ${q}`).join("\n");
      }
      if (response.suggestedSolutions && response.suggestedSolutions.length > 0) {
        responseContent += "\n\nREPAIR SEQUENCE:\n" + response.suggestedSolutions.map((s, idx) => `${idx + 1}. ${s}`).join("\n");
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', content: responseContent, data: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "CRITICAL: NEURAL LINK SEVERED. ATTEMPTING RECONNECT..." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto glass border-white/10 rounded-[4rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
      <div className="absolute inset-0 scan-line opacity-20 pointer-events-none" />
      
      <CardHeader className="p-12 border-b border-white/5 bg-primary/[0.01] relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-8">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center neon-glow shadow-2xl">
              <Cpu className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-primary text-4xl font-black tracking-tighter leading-tight">NEURAL ANALYZER</span>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Kernel: Stable
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                  v4.1.0-AI
                </span>
              </div>
            </div>
          </CardTitle>
          <div className="hidden lg:grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
             <div className="glass px-5 py-3 rounded-2xl border-white/5 flex items-center gap-2">
                <Shield className="w-3 h-3 text-primary" />
                Auth: verified
             </div>
             <div className="glass px-5 py-3 rounded-2xl border-white/5 flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" />
                Power: optimal
             </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow bg-grid relative">
        <ScrollArea className="h-[700px] p-12">
          <div className="space-y-16">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-8 duration-700`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${
                  msg.role === 'user' ? 'bg-secondary neon-glow' : 'glass border-white/10'
                }`}>
                  {msg.role === 'user' ? <User className="w-7 h-7 text-white" /> : <Sparkles className="w-7 h-7 text-primary" />}
                </div>
                <div className={`p-10 rounded-[3.5rem] max-w-[85%] text-lg leading-relaxed font-medium shadow-3xl relative overflow-hidden ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none border border-white/10' 
                    : 'glass text-foreground rounded-tl-none border-l-4 border-l-primary'
                }`}>
                  {msg.role === 'model' && (
                    <div className="absolute top-4 right-6 opacity-10">
                      <Terminal className="w-12 h-12" />
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap font-body text-lg">
                    {msg.content}
                  </pre>
                  {msg.data?.recommendedGuides && msg.data.recommendedGuides.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-2">
                         <Info className="w-4 h-4" />
                         Linked Protocols Found:
                       </p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {msg.data.recommendedGuides.map((guide: any) => (
                            <Link key={guide.id} href={guide.url}>
                              <div className="p-4 glass rounded-2xl border-white/5 hover:border-primary/50 transition-all flex items-center justify-between group/link">
                                 <span className="text-xs font-bold truncate">{guide.title}</span>
                                 <Send className="w-4 h-4 opacity-30 group-hover/link:opacity-100 group-hover/link:text-primary transition-all" />
                              </div>
                            </Link>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-8">
                <div className="w-14 h-14 rounded-2xl glass border-white/10 flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-primary animate-spin" />
                </div>
                <div className="glass p-10 rounded-[3.5rem] rounded-tl-none border-l-4 border-l-primary">
                  <div className="flex gap-3">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Running Neural Simulation...</p>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-12 bg-white/[0.01] border-t border-white/5 relative">
        <div className="flex w-full gap-8 items-center">
          <div className="relative flex-grow group">
            <Input
              placeholder="ENTER COMMAND OR HARDWARE TELEMETRY..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-full border-white/10 bg-white/5 focus:border-primary/50 h-24 pl-12 pr-32 text-2xl font-bold glass tracking-tight placeholder:text-muted-foreground/20 uppercase"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading}
              className="absolute right-4 top-4 rounded-full h-16 w-16 p-0 bg-primary neon-glow hover:scale-110 active:scale-95 transition-all shadow-primary/20 shadow-2xl flex items-center justify-center"
            >
              <Send className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}