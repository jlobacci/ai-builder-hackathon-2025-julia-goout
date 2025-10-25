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
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type MessageMode = 'out' | 'dm';

interface EventThread {
  invite_id: number;
  title: string;
  last_message_at: string | null;
  last_message_body: string | null;
  last_message_sender_id: string | null;
}

interface DMThread {
  thread_id: number;
  other_user_id: string;
  other_display_name: string;
  other_handle: string;
  other_avatar: string | null;
  last_message_at: string | null;
  last_message_body: string | null;
  last_message_sender_id: string | null;
  unread_count_for_me: number;
}

interface OutMessage {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface DMMessage {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [mode, setMode] = useState<MessageMode>('out');
  const [eventThreads, setEventThreads] = useState<EventThread[]>([]);
  const [dmThreads, setDMThreads] = useState<DMThread[]>([]);
  
  const [selectedInviteId, setSelectedInviteId] = useState<number | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  
  const [outMessages, setOutMessages] = useState<OutMessage[]>([]);
  const [dmMessages, setDMMessages] = useState<DMMessage[]>([]);
  const [dmProfiles, setDMProfiles] = useState<Map<string, { display_name: string; avatar_url: string | null }>>(new Map());
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [otherUserName, setOtherUserName] = useState<string>('');
  
  const [eventsOpen, setEventsOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const messagePollInterval = useRef<NodeJS.Timeout | null>(null);

  // Initial load and deep link handling
  useEffect(() => {
    if (!user) return;
    
    loadThreads();
    
    const inviteIdParam = searchParams.get('invite_id');
    const dmThreadIdParam = searchParams.get('dm_thread_id');
    const personIdParam = searchParams.get('person_id');
    
    if (inviteIdParam) {
      handleSelectEvent(Number(inviteIdParam));
    } else if (dmThreadIdParam) {
      handleSelectDMThread(Number(dmThreadIdParam));
    } else if (personIdParam) {
      findOrCreateDMThread(personIdParam);
    }
  }, [user]);

  // Poll threads every 10s
  useEffect(() => {
    if (!user) return;
    
    pollInterval.current = setInterval(() => {
      loadThreads();
    }, 10000);
    
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [user]);

  // Poll messages every 5s
  useEffect(() => {
    if (mode === 'out' && selectedInviteId) {
      messagePollInterval.current = setInterval(() => {
        loadOutMessages(selectedInviteId);
      }, 5000);
    } else if (mode === 'dm' && selectedThreadId) {
      messagePollInterval.current = setInterval(() => {
        loadDMMessages(selectedThreadId);
      }, 5000);
    }
    
    return () => {
      if (messagePollInterval.current) clearInterval(messagePollInterval.current);
    };
  }, [mode, selectedInviteId, selectedThreadId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [outMessages, dmMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    if (!user) return;

    // Load event threads
    const { data: eventData } = await supabase
      .from('v_invite_threads')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false });
    
    if (eventData) {
      setEventThreads(eventData as EventThread[]);
    }

    // Load DM threads
    const { data: dmData } = await supabase
      .from('v_dm_threads_for_user')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false });
    
    if (dmData) {
      setDMThreads(dmData as DMThread[]);
    }
  };

  const findOrCreateDMThread = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      // Normalize order: smaller UUID first
      const [userA, userB] = [user.id, otherUserId].sort();
      
      // Try to find existing thread
      let { data: existing } = await supabase
        .from('dm_threads')
        .select('id')
        .eq('user_a', userA)
        .eq('user_b', userB)
        .single();
      
      if (!existing) {
        // Create new thread
        const { data: created, error } = await supabase
          .from('dm_threads')
          .insert({ user_a: userA, user_b: userB })
          .select('id')
          .single();
        
        if (error) throw error;
        existing = created;
      }
      
      if (existing) {
        handleSelectDMThread(existing.id);
        setSearchParams({ dm_thread_id: existing.id.toString() });
      }
    } catch (error: any) {
      toast.error('Erro ao criar conversa');
      console.error(error);
    }
  };

  const handleSelectEvent = async (inviteId: number) => {
    setMode('out');
    setSelectedInviteId(inviteId);
    setSelectedThreadId(null);
    setSearchParams({ invite_id: inviteId.toString() });
    
    await loadOutMessages(inviteId);
    await loadEventTitle(inviteId);
    await markOutMessagesAsRead(inviteId);
  };

  const handleSelectDMThread = async (threadId: number) => {
    setMode('dm');
    setSelectedThreadId(threadId);
    setSelectedInviteId(null);
    setSearchParams({ dm_thread_id: threadId.toString() });
    
    const thread = dmThreads.find(t => t.thread_id === threadId);
    if (thread) {
      setOtherUserName(thread.other_display_name);
    }
    
    await loadDMMessages(threadId);
    await markDMMessagesAsRead(threadId);
  };

  const loadEventTitle = async (inviteId: number) => {
    const { data } = await supabase
      .from('invites')
      .select('title')
      .eq('id', inviteId)
      .single();
    
    if (data) setEventTitle(data.title);
  };

  const loadOutMessages = async (inviteId: number) => {
    const { data } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        body,
        created_at,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('invite_id', inviteId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setOutMessages(data as any);
    }
  };

  const loadDMMessages = async (threadId: number) => {
    const { data } = await supabase
      .from('dm_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setDMMessages(data);
      
      // Load profiles for all senders
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', senderIds);
      
      if (profiles) {
        const profileMap = new Map();
        profiles.forEach(p => {
          profileMap.set(p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url });
        });
        setDMProfiles(profileMap);
      }
    }
  };

  const markOutMessagesAsRead = async (inviteId: number) => {
    if (!user) return;
    
    const unreadMessages = outMessages.filter(m => 
      m.sender_id !== user.id
    );
    
    for (const msg of unreadMessages) {
      await supabase
        .from('message_reads')
        .upsert({ message_id: msg.id, user_id: user.id }, { onConflict: 'message_id,user_id' });
    }
  };

  const markDMMessagesAsRead = async (threadId: number) => {
    if (!user) return;
    
    const unreadMessages = dmMessages.filter(m => 
      m.sender_id !== user.id
    );
    
    for (const msg of unreadMessages) {
      await supabase
        .from('dm_reads')
        .upsert({ message_id: msg.id, user_id: user.id }, { onConflict: 'message_id,user_id' });
    }
    
    // Refresh threads to update count
    loadThreads();
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;
    
    setLoading(true);
    try {
      if (mode === 'out' && selectedInviteId) {
        // Send to Out
        const { error } = await supabase
          .from('messages')
          .insert({
            invite_id: selectedInviteId,
            sender_id: user.id,
            body: newMessage.trim()
          });
        
        if (error) throw error;
        
        // Optimistic update
        setOutMessages(prev => [...prev, {
          id: Date.now(),
          sender_id: user.id,
          body: newMessage.trim(),
          created_at: new Date().toISOString(),
          sender: { display_name: 'Você', avatar_url: null }
        }]);
        
        setNewMessage('');
        setTimeout(() => loadOutMessages(selectedInviteId), 500);
      } else if (mode === 'dm' && selectedThreadId) {
        // Send to DM
        const { error } = await supabase
          .from('dm_messages')
          .insert({
            thread_id: selectedThreadId,
            sender_id: user.id,
            body: newMessage.trim()
          });
        
        if (error) throw error;
        
        // Optimistic update
        setDMMessages(prev => [...prev, {
          id: Date.now(),
          thread_id: selectedThreadId,
          sender_id: user.id,
          body: newMessage.trim(),
          created_at: new Date().toISOString()
        }]);
        
        setNewMessage('');
        setTimeout(() => loadDMMessages(selectedThreadId), 500);
      }
    } catch (error: any) {
      toast.error('Erro ao enviar mensagem');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    } catch {
      return '';
    }
  };

  const getUnreadCount = (inviteId: number): number => {
    if (!user) return 0;
    const thread = eventThreads.find(t => t.invite_id === inviteId);
    // Count unread based on message_reads (simplified)
    return 0; // Will be calculated properly in v_invite_threads
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4 bg-card rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-6">
        {/* Left Sidebar - Threads */}
        <div className="w-80 border-r border-border pr-4 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {/* Events Accordion */}
              <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Eventos (Outs)
                    </span>
                    {eventsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-2">
                  {eventThreads.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-4 py-2">Nenhum evento</p>
                  ) : (
                    eventThreads.map(thread => (
                      <button
                        key={thread.invite_id}
                        onClick={() => handleSelectEvent(thread.invite_id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          mode === 'out' && selectedInviteId === thread.invite_id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{thread.title}</p>
                            {thread.last_message_body && (
                              <p className="text-sm text-muted-foreground truncate">
                                {thread.last_message_body}
                              </p>
                            )}
                            {thread.last_message_at && (
                              <p className="text-xs text-muted-foreground">
                                {formatTime(thread.last_message_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* People (DM) Accordion */}
              <Collapsible open={peopleOpen} onOpenChange={setPeopleOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Pessoas
                    </span>
                    {peopleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-2">
                  {dmThreads.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-4 py-2">Nenhuma conversa</p>
                  ) : (
                    dmThreads.map(thread => (
                      <button
                        key={thread.thread_id}
                        onClick={() => handleSelectDMThread(thread.thread_id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          mode === 'dm' && selectedThreadId === thread.thread_id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={thread.other_avatar || undefined} />
                            <AvatarFallback>{thread.other_display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{thread.other_display_name}</p>
                              {thread.unread_count_for_me > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {thread.unread_count_for_me}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">@{thread.other_handle}</p>
                            {thread.last_message_body && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {thread.last_message_body}
                              </p>
                            )}
                            {thread.last_message_at && (
                              <p className="text-xs text-muted-foreground">
                                {formatTime(thread.last_message_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Messages */}
        <div className="flex-1 flex flex-col">
          {!selectedInviteId && !selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione uma conversa para começar
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b p-4 bg-background">
                {mode === 'out' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Mensagens do Out: {eventTitle}</h2>
                    </div>
                    {selectedInviteId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/out/${selectedInviteId}`)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Out
                      </Button>
                    )}
                  </div>
                )}
                {mode === 'dm' && (
                  <div>
                    <h2 className="text-lg font-semibold">Mensagens com {otherUserName}</h2>
                  </div>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {mode === 'out' && outMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const showAvatar = idx === outMessages.length - 1 || 
                                      outMessages[idx + 1]?.sender_id !== msg.sender_id;
                    
                    return (
                       <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && showAvatar && (
                            <Avatar 
                              className="w-8 h-8 flex-shrink-0 avatar-clickable"
                              onClick={() => {
                                // Get sender's handle
                                const msgData = outMessages.find(m => m.id === msg.id);
                                const senderProfile = eventThreads.find(t => t.invite_id === selectedInviteId);
                                // Navigate to profile (we need to fetch the handle first)
                                supabase
                                  .from('profiles')
                                  .select('handle')
                                  .eq('user_id', msg.sender_id)
                                  .single()
                                  .then(({ data }) => {
                                    if (data) navigate(`/u/${data.handle}`);
                                  });
                              }}
                            >
                              <AvatarImage src={msg.sender.avatar_url || undefined} />
                              <AvatarFallback>{msg.sender.display_name[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          {!isMe && !showAvatar && <div className="w-8" />}
                          
                          <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && (
                              <p 
                                className="text-xs text-muted-foreground px-3 cursor-pointer hover:underline"
                                onClick={() => {
                                  supabase
                                    .from('profiles')
                                    .select('handle')
                                    .eq('user_id', msg.sender_id)
                                    .single()
                                    .then(({ data }) => {
                                      if (data) navigate(`/u/${data.handle}`);
                                    });
                                }}
                              >
                                {msg.sender.display_name}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                            </div>
                          </div>
                          
                          {isMe && showAvatar && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={user?.user_metadata?.avatar_url} />
                              <AvatarFallback>Eu</AvatarFallback>
                            </Avatar>
                          )}
                          {isMe && !showAvatar && <div className="w-8" />}
                        </div>
                      </div>
                    );
                  })}

                  {mode === 'dm' && dmMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const showAvatar = idx === dmMessages.length - 1 || 
                                      dmMessages[idx + 1]?.sender_id !== msg.sender_id;
                    const profile = dmProfiles.get(msg.sender_id);
                    
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && showAvatar && (
                            <Avatar 
                              className="w-8 h-8 flex-shrink-0 avatar-clickable"
                              onClick={() => {
                                supabase
                                  .from('profiles')
                                  .select('handle')
                                  .eq('user_id', msg.sender_id)
                                  .single()
                                  .then(({ data }) => {
                                    if (data) navigate(`/u/${data.handle}`);
                                  });
                              }}
                            >
                              <AvatarImage src={profile?.avatar_url || undefined} />
                              <AvatarFallback>{profile?.display_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                          )}
                          {!isMe && !showAvatar && <div className="w-8" />}
                          
                          <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                            </div>
                          </div>
                          
                          {isMe && showAvatar && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={user?.user_metadata?.avatar_url} />
                              <AvatarFallback>Eu</AvatarFallback>
                            </Avatar>
                          )}
                          {isMe && !showAvatar && <div className="w-8" />}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4 bg-background">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
