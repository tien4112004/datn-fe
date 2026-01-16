import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ArrowUpIcon, Bot, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import { MOCK_AI_RESPONSES } from '../constants/mockData';
import type { ChatMessage } from '../types';

const DashboardChat = () => {
  const { t } = useTranslation('dashboard');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'agent', content: t('chat.greeting'), timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getMockResponse = (userMessage: string): string => {
    // Simple keyword matching for mock responses
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('image') || lowerMessage.includes('picture')) {
      return MOCK_AI_RESPONSES.image;
    } else if (lowerMessage.includes('presentation') || lowerMessage.includes('slide')) {
      return MOCK_AI_RESPONSES.presentation;
    } else if (lowerMessage.includes('mindmap') || lowerMessage.includes('mind map')) {
      return MOCK_AI_RESPONSES.mindmap;
    } else if (lowerMessage.includes('help')) {
      return MOCK_AI_RESPONSES.help;
    } else {
      return MOCK_AI_RESPONSES.default;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate typing delay
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);

    // Add AI response
    const aiMessage: ChatMessage = {
      role: 'agent',
      content: getMockResponse(input),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <Card className="flex h-[500px] flex-col" id="chat">
      <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
        <Avatar className="border">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium">AI Assistant</p>
          <p className="text-muted-foreground text-xs">{t('chat.online')}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex items-start gap-2', message.role === 'user' && 'flex-row-reverse')}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={cn(message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                >
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'flex max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted flex gap-1 rounded-lg px-3 py-2">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>
                  •
                </span>
                <span className="animate-bounce" style={{ animationDelay: '400ms' }}>
                  •
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <form onSubmit={handleSubmit} className="relative w-full">
          <Input
            placeholder={t('chat.placeholder')}
            className="pr-10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
            disabled={input.trim() === ''}
          >
            <ArrowUpIcon className="h-3.5 w-3.5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default DashboardChat;
