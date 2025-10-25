import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Calendar, User, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EventThread {
  invite_id: number;
  title: string;
  last_message_at: string | null;
  last_message_body: string | null;
  unread_count: number;
}

interface PersonThread {
  person_id: string;
  person_name: string;
  person_avatar: string | null;
  last_invite_id: number;
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [eventThreads, setEventThreads] = useState<EventThread[]>([]);
  const [personThreads, setPersonThreads] = useState<PersonThread[]>([]);
  const [selectedInviteId, setSelectedInviteId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [eventsOpen, setEventsOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadThreads();
      
      const inviteIdParam = searchParams.get('invite_id');
      const personIdParam = searchParams.get('person_id');
      
      if (inviteIdParam) {
        setSelectedInviteId(Number(inviteIdParam));
        setSelectedPersonId(null);
      } else if (personIdParam) {
        setSelectedPersonId(personIdParam);
        setSelectedInviteId(null);
      }
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedInviteId) {
      loadMessages(selectedInviteId);
      loadEventTitle(selectedInviteId);
      markThreadAsRead(selectedInviteId);
      subscribeToMessages(selectedInviteId);
    }
  }, [selectedInviteId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    if (!user) return;

    // Load event threads
    const { data: authorInvites } = await supabase
      .from('invites')
      .select('id')
      .eq('author_id', user.id);

    const { data: applications } = await supabase
      .from('applications')
      .select('invite_id')
      .eq('applicant_id', user.id);

    const allInviteIds = [
      ...(authorInvites?.map(i => i.id) || []),
      ...(applications?.map(a => a.invite_id).filter(Boolean) || [])
    ];

    if (allInviteIds.length > 0) {
      const { data: threadData } = await supabase
        .from('v_invite_threads')
        .select('*')
        .in('invite_id', allInviteIds)
        .order('last_message_at', { ascending: false });

      // Calculate unread counts for events
      const threadsWithUnread: EventThread[] = [];
      
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

      setEventThreads(threadsWithUnread);
    }

    // Load person threads
    const { data: peopleData } = await supabase
      .from('v_people_threads')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (peopleData) {
      // Calculate unread counts for people
      const peopleWithUnread: PersonThread[] = [];
      
      for (const person of peopleData) {
        // Get all invite_ids for this person
        const { data: personInvites } = await supabase
          .from('messages')
          .select('invite_id')
          .or(`sender_id.eq.${person.person_id},sender_id.eq.${user.id}`)
          .in('invite_id', allInviteIds);

        const personInviteIds = [...new Set(personInvites?.map(m => m.invite_id) || [])];

        let totalUnread = 0;
        for (const inviteId of personInviteIds) {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('invite_id', inviteId)
            .eq('sender_id', person.person_id)
            .not('id', 'in', 
              `(select message_id from message_reads where user_id = '${user.id}')`
            );
          totalUnread += count || 0;
        }

        peopleWithUnread.push({
          person_id: person.person_id!,
          person_name: person.person_name!,
          person_avatar: person.person_avatar,
          last_invite_id: person.last_invite_id!,
          last_message_at: person.last_message_at,
          last_message_body: person.last_message_body,
          unread_count: totalUnread
        });
      }

      setPersonThreads(peopleWithUnread);
    }
  };

  const loadEventTitle = async (inviteId: number) => {
    const { data } = await supabase
      .from('invites')
      .select('title')
      .eq('id', inviteId)
      .single();

    if (data) {
      setEventTitle(data.title);
    }
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

    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('invite_id', inviteId)
      .neq('sender_id', user.id);

    if (!unreadMessages || unreadMessages.length === 0) return;

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
      
      loadThreads();
    }
  };

  const subscribeToMessages = (inviteId: number) => {
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

    if (!newMessage.trim() || !user || !selectedInviteId) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          invite_id: selectedInviteId,
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

  const handleEventClick = (thread: EventThread) => {
    setSelectedInviteId(thread.invite_id);
    setSelectedPersonId(null);
    setEventTitle(thread.title);
    setPersonName('');
  };

  const handlePersonClick = async (thread: PersonThread) => {
    setSelectedInviteId(thread.last_invite_id);
    setSelectedPersonId(thread.person_id);
    setPersonName(thread.person_name);
    
    // Load event title
    const { data } = await supabase
      .from('invites')
      .select('title')
      .eq('id', thread.last_invite_id)
      .single();
    
    if (data) {
      setEventTitle(data.title);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mensagens</h1>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Thread lists */}
          <Card className="col-span-4 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {/* Events section */}
                <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Eventos (Outs)</span>
                      {eventThreads.reduce((sum, t) => sum + t.unread_count, 0) > 0 && (
                        <Badge variant="destructive" className="h-5 px-2">
                          {eventThreads.reduce((sum, t) => sum + t.unread_count, 0)}
                        </Badge>
                      )}
                    </div>
                    {eventsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {eventThreads.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Sem conversas ainda
                      </p>
                    ) : (
                      eventThreads.map((thread) => (
                        <button
                          key={thread.invite_id}
                          onClick={() => handleEventClick(thread)}
                          className={`w-full text-left p-3 rounded-lg transition-colors border-l-4 ${
                            selectedInviteId === thread.invite_id && !selectedPersonId
                              ? 'bg-primary/10 border-primary'
                              : 'border-transparent hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate text-sm">{thread.title}</p>
                                {thread.unread_count > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                                    •
                                  </Badge>
                                )}
                              </div>
                              {thread.last_message_body && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {thread.last_message_body}
                                </p>
                              )}
                            </div>
                            {thread.last_message_at && (
                              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                {formatDate(thread.last_message_at)}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* People section */}
                <Collapsible open={peopleOpen} onOpenChange={setPeopleOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-semibold">Pessoas</span>
                      {personThreads.reduce((sum, t) => sum + t.unread_count, 0) > 0 && (
                        <Badge variant="destructive" className="h-5 px-2">
                          {personThreads.reduce((sum, t) => sum + t.unread_count, 0)}
                        </Badge>
                      )}
                    </div>
                    {peopleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {personThreads.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Sem conversas ainda
                      </p>
                    ) : (
                      personThreads.map((thread) => (
                        <button
                          key={thread.person_id}
                          onClick={() => handlePersonClick(thread)}
                          className={`w-full text-left p-3 rounded-lg transition-colors border-l-4 ${
                            selectedPersonId === thread.person_id
                              ? 'bg-primary/10 border-primary'
                              : 'border-transparent hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={thread.person_avatar || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {thread.person_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate text-sm">{thread.person_name}</p>
                                {thread.unread_count > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                                    •
                                  </Badge>
                                )}
                              </div>
                              {thread.last_message_body && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {thread.last_message_body}
                                </p>
                              )}
                            </div>
                            {thread.last_message_at && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDate(thread.last_message_at)}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
          </Card>

          {/* Message area */}
          <Card className="col-span-8 flex flex-col">
            {!selectedInviteId ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Selecione uma conversa para começar
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      {selectedPersonId ? (
                        <>
                          <h2 className="font-semibold">
                            Mensagens com <span className="text-primary">{personName}</span>
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            em {eventTitle}
                          </p>
                        </>
                      ) : (
                        <h2 className="font-semibold">
                          Mensagens do Out: <span className="text-primary">{eventTitle}</span>
                        </h2>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/out/${selectedInviteId}`)}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir Out
                    </Button>
                  </div>
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
                            <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
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
