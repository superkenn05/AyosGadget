"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Cpu, Terminal } from 'lucide-react';
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
      content: 'System Initialized. I am Ayos AI, your neural repair assistant. Please provide device specifications or describe the hardware fault to begin diagnosis.',
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
        responseContent += "\n\nCRITICAL QUESTIONS:\n" + response.questionsToAsk.map(q => `> ${q}`).join("\n");
      }
      if (response.suggestedSolutions && response.suggestedSolutions.length > 0) {
        responseContent += "\n\nREPAIR STEPS:\n" + response.suggestedSolutions.map((s, idx) => `${idx + 1}. ${s}`).join("\n");
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', content: responseContent, data: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "SYSTEM ERROR: Connection to neural engine lost. Please retry the handshake." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto glass border-white/10 rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <CardHeader className="p-10 border-b border-white/5 bg-primary/[0.02]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-6 text-primary text-3xl font-black tracking-tighter">
            <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center neon-glow">
              <Cpu className="w-9 h-9 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span>AYOS NEURAL ENGINE</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase">Core: Active</span>
              </div>
            </div>
          </CardTitle>
          <div className="hidden sm:flex items-center gap-3 px-5 py-2 glass rounded-full border-white/10">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">v2.4.0-STABLE</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow bg-grid">
        <ScrollArea className="h-[650px] p-10">
          <div className="space-y-12">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-700`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-secondary neon-glow' : 'glass border-white/10'
                }`}>
                  {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-primary" />}
                </div>
                <div className={`p-8 rounded-[2.5rem] max-w-[80%] text-lg leading-relaxed font-medium shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none border-glow' 
                    : 'glass text-foreground rounded-tl-none border-l-4 border-l-primary'
                }`}>
                  <pre className="whitespace-pre-wrap font-body">
                    {msg.content}
                  </pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-primary animate-spin" />
                </div>
                <div className="glass p-8 rounded-[2.5rem] rounded-tl-none border-l-4 border-l-primary">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-10 bg-white/[0.02] border-t border-white/5">
        <div className="flex w-full gap-6 items-center">
          <div className="relative flex-grow group">
            <Input
              placeholder="ENTER COMMAND OR DATA DESCRIPTION..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-full border-white/10 bg-white/5 focus:border-primary/50 h-20 pl-10 pr-24 text-xl font-bold glass tracking-tight placeholder:text-muted-foreground/30 uppercase"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading}
              className="absolute right-3 top-3 rounded-full h-14 w-14 p-0 bg-primary neon-glow hover:scale-110 active:scale-95 transition-all shadow-primary/20 shadow-xl"
            >
              <Send className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}