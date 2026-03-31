
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
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
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-none rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-primary p-6">
        <CardTitle className="flex items-center gap-3 text-primary-foreground text-xl">
          <Bot className="w-6 h-6" />
          Ayos AI Troubleshooter
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-6">
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-secondary' : 'bg-primary/20'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted text-foreground rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-4 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 bg-slate-50 border-t">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Ilarawan ang problema..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="rounded-xl border-slate-200 focus:ring-primary h-12"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading}
            className="rounded-xl h-12 w-12 p-0 bg-primary"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
