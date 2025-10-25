import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface OutMessagesBlockProps {
  inviteId: number;
  onUnreadUpdate?: () => void;
}

export const OutMessagesBlock: React.FC<OutMessagesBlockProps> = ({ inviteId, onUnreadUpdate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
    subscribeToMessages();
  }, [inviteId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('invite_id', inviteId)
      .order('created_at', { ascending: true })
      .limit(3);

    if (data) {
      setMessages(data as Message[]);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    // Get messages from others that haven't been read
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('invite_id', inviteId)
      .neq('sender_id', user.id);

    if (!unreadMessages || unreadMessages.length === 0) return;

    // Check which ones are not already marked as read
    const { data: alreadyRead } = await supabase
      .from('message_reads')
      .select('message_id')
      .eq('user_id', user.id)
      .in('message_id', unreadMessages.map(m => m.id));

    const alreadyReadIds = new Set(alreadyRead?.map(r => r.message_id) || []);
    const toMarkAsRead = unreadMessages.filter(m => !alreadyReadIds.has(m.id));

    if (toMarkAsRead.length > 0) {
      await supabase
        .from('message_reads')
        .insert(
          toMarkAsRead.map(m => ({
            message_id: m.id,
            user_id: user.id
          }))
        );
      
      onUnreadUpdate?.();
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${inviteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `invite_id=eq.${inviteId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as Message]);
            
            // Mark as read if from another user
            if (user && data.sender_id !== user.id) {
              await supabase
                .from('message_reads')
                .insert({
                  message_id: data.id,
                  user_id: user.id
                });
              onUnreadUpdate?.();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          invite_id: inviteId,
          sender_id: user.id,
          body: newMessage.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast.error('Falha ao enviar, tente novamente');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Sem novas mensagens
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={message.sender.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {message.sender.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.sender.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className={`inline-block px-3 py-1.5 rounded-lg text-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    }`}
                  >
                    {message.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Responder..."
          disabled={loading}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={loading || !newMessage.trim()} 
          size="sm"
          className="btn-primary"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
