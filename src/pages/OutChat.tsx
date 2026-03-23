import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MESSAGES, MOCK_PROFILES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

const OutChat: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(() =>
    MOCK_MESSAGES.filter(m => m.invite_id === Number(id))
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setMessages(prev => [...prev, { id: Date.now(), invite_id: Number(id), sender_id: user.id, body: newMessage.trim(), created_at: new Date().toISOString() }]);
    setNewMessage('');
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader><CardTitle>Chat do Out</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma mensagem ainda.</p>
              ) : messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                const sender = MOCK_PROFILES.find(p => p.user_id === message.sender_id);
                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8"><AvatarImage src={sender?.avatar_url || undefined} /><AvatarFallback className="bg-primary text-primary-foreground text-xs">{sender?.display_name?.[0] || 'U'}</AvatarFallback></Avatar>
                    <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{sender?.display_name || 'Você'}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-lg ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{message.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." />
              <Button type="submit" disabled={!newMessage.trim()} className="btn-primary"><Send className="w-4 h-4" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OutChat;
