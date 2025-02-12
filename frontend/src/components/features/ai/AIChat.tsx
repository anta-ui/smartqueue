"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { ChatbotMessage, ChatbotSession } from '@/types/ai';

interface AIChatProps {
  userId: string;
  initialContext?: {
    queueId?: string;
    ticketId?: string;
  };
  onEscalate?: (session: ChatbotSession) => void;
}

export function AIChat({ userId, initialContext, onEscalate }: AIChatProps) {
  const [session, setSession] = useState<ChatbotSession | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/ai/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, context: initialContext })
        });
        if (!response.ok) throw new Error('Failed to initialize chat session');
        const newSession: ChatbotSession = await response.json();
        setSession(newSession);
        setMessages(newSession.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start chat');
      }
    };

    initSession();
  }, [userId, initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !session) return;

    const newMessage: ChatbotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      context: initialContext
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: newMessage
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data: {
        message: ChatbotMessage;
        session: ChatbotSession;
      } = await response.json();

      setMessages(prev => [...prev, data.message]);
      setSession(data.session);

      if (data.session.status === 'escalated' && onEscalate) {
        onEscalate(data.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process message');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />
          Assistant IA
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar>
                  {message.role === 'user' ? (
                    <UserCircleIcon className="h-8 w-8" />
                  ) : (
                    <ChatBubbleLeftIcon className="h-8 w-8" />
                  )}
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {error && (
        <div className="p-2 text-sm text-red-500 text-center border-t">
          {error}
        </div>
      )}

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={loading || !session || session.status === 'escalated'}
          />
          <Button
            type="submit"
            disabled={loading || !session || session.status === 'escalated'}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
