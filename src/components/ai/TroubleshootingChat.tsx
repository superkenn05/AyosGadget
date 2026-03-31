"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
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
      content: 'Kamusta! Ako si Ayos AI. Anong gadget ang may problema at ano ang nangyayari dito?',
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
        responseContent += "\n\n" + response.questionsToAsk.join("\n");
      }
      if (response.suggestedSolutions && response.suggestedSolutions.length > 0) {
        responseContent += "\n\nTry these:\n" + response.suggestedSolutions.map(s => `- ${s}`).join("\n");
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', content: responseContent, data: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "Pasensya na, nagkaroon ng error sa pagkonekta sa AI. Pakisubukan muli." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto glass border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
      <CardHeader className="p-8 border-b border-white/5 bg-primary/5">
        <CardTitle className="flex items-center gap-4 text-primary text-2xl font-black">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center neon-glow">
            <Bot className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span>Ayos AI Assistant</span>
            <span className="text-xs font-bold text-primary/60 tracking-widest uppercase">Online & Ready to Help</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-[600px] p-8">
          <div className="space-y-8">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-secondary' : 'glass border-white/10'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-primary" />}
                </div>
                <div className={`p-6 rounded-[2rem] max-w-[85%] text-base leading-relaxed font-medium ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none neon-glow shadow-primary/20' 
                    : 'glass text-foreground rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl glass border-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="glass p-6 rounded-[2rem] rounded-tl-none">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-8 bg-white/5 border-t border-white/5">
        <div className="flex w-full gap-4 items-center">
          <div className="relative flex-grow">
            <Input
              placeholder="Sabihin ang problema ng iyong gadget..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-[1.5rem] border-white/10 bg-white/5 focus:ring-primary h-16 pl-6 pr-16 text-lg font-medium glass"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading}
              className="absolute right-2 top-2 rounded-xl h-12 w-12 p-0 bg-primary neon-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
