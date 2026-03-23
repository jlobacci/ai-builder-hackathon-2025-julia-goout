import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MESSAGES, MOCK_PROFILES } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface OutMessagesBlockProps {
  inviteId: number;
  onUnreadUpdate?: () => void;
}

export const OutMessagesBlock: React.FC<OutMessagesBlockProps> = ({ inviteId }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState(() => 
    MOCK_MESSAGES.filter(m => m.invite_id === inviteId).slice(-3)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg = {
      id: Date.now(),
      invite_id: inviteId,
      sender_id: user.id,
      body: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, msg]);
    setNewMessage('');
    toast.success('Mensagem enviada!');
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {localMessages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">Sem novas mensagens</p>
        ) : (
          localMessages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            const sender = MOCK_PROFILES.find(p => p.user_id === message.sender_id);
            return (
              <div key={message.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={sender?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{sender?.display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{sender?.display_name || 'Você'}</span>
                  </div>
                  <div className={`inline-block px-3 py-1.5 rounded-lg text-sm ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    {message.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Responder..." className="flex-1" />
        <Button type="submit" disabled={!newMessage.trim()} size="sm" className="btn-primary"><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  );
};
