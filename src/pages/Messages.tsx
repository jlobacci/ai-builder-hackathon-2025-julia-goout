import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Thread {
  invite_id: number;
  title: string;
  last_message_at: string | null;
  last_message_body: string | null;
  unread_count: number;
}

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

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadThreads();
      const inviteIdParam = searchParams.get('invite_id');
      if (inviteIdParam) {
        setSelectedThread(Number(inviteIdParam));
      }
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
      markThreadAsRead(selectedThread);
      subscribeToMessages(selectedThread);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    if (!user) return;

    // Get invites where user is author
    const { data: authorInvites } = await supabase
      .from('invites')
      .select('id, title')
      .eq('author_id', user.id);

    // Get invites where user is applicant
    const { data: applications } = await supabase
      .from('applications')
      .select('invite:invites(id, title)')
      .eq('applicant_id', user.id);

    const allInviteIds = [
      ...(authorInvites?.map(i => i.id) || []),
      ...(applications?.map(a => a.invite?.id).filter(Boolean) || [])
    ];

    if (allInviteIds.length === 0) return;

    // Get thread info from v_invite_threads
    const { data: threadData } = await supabase
      .from('v_invite_threads')
      .select('*')
      .in('invite_id', allInviteIds)
      .order('last_message_at', { ascending: false });

    // Calculate unread counts
    const threadsWithUnread: Thread[] = [];
    
    for (const thread of threadData || []) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('invite_id', thread.invite_id)
        .neq('sender_id', user.id)
        .not('id', 'in', 
          `(select message_id from message_reads where user_id = '${user.id}')`
        );

      threadsWithUnread.push({
        invite_id: thread.invite_id!,
        title: thread.title!,
        last_message_at: thread.last_message_at,
        last_message_body: thread.last_message_body,
        unread_count: count || 0
      });
    }

    setThreads(threadsWithUnread);
  };

  const loadMessages = async (inviteId: number) => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('invite_id', inviteId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
  };

  const markThreadAsRead = async (inviteId: number) => {
    if (!user) return;

    // Get unread messages
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
      
      loadThreads(); // Refresh unread counts
    }
  };

  const subscribeToMessages = (inviteId: number) => {
    const channel = supabase
      .channel(`messages-full-${inviteId}`)
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
            }
            
            loadThreads();
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

    if (!newMessage.trim() || !user || !selectedThread) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          invite_id: selectedThread,
          sender_id: user.id,
          body: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast.error('Falha ao enviar, tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const selectedThreadData = threads.find(t => t.invite_id === selectedThread);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mensagens</h1>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Thread list */}
          <Card className="col-span-4 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {threads.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma conversa
                  </p>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.invite_id}
                      onClick={() => setSelectedThread(thread.invite_id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedThread === thread.invite_id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{thread.title}</p>
                            {thread.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                                {thread.unread_count}
                              </Badge>
                            )}
                          </div>
                          {thread.last_message_body && (
                            <p className="text-sm opacity-80 truncate mt-1">
                              {thread.last_message_body}
                            </p>
                          )}
                        </div>
                        {thread.last_message_at && (
                          <span className="text-xs opacity-70 ml-2">
                            {formatDate(thread.last_message_at)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Message area */}
          <Card className="col-span-8 flex flex-col">
            {!selectedThread ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Selecione uma conversa para começar
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-semibold">{selectedThreadData?.title}</h2>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma mensagem ainda. Seja o primeiro a enviar!
                      </p>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {message.sender.display_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {message.sender.display_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                              <div
                                className={`inline-block px-4 py-2 rounded-lg ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
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
                </ScrollArea>

                <CardContent className="border-t p-4">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nova mensagem..."
                      disabled={loading}
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !newMessage.trim()}
                      className="btn-primary"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
