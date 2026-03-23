import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MESSAGES, MOCK_PROFILES, MOCK_INVITES, MOCK_DM_THREADS, MOCK_DM_MESSAGES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Calendar, User, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'out' | 'dm'>('out');
  const [selectedInviteId, setSelectedInviteId] = useState<number | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [eventsOpen, setEventsOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [localOutMessages, setLocalOutMessages] = useState(MOCK_MESSAGES);
  const [localDmMessages, setLocalDmMessages] = useState(MOCK_DM_MESSAGES);

  if (!user) return null;

  // Event threads from invites that have messages
  const inviteIds = [...new Set(localOutMessages.map(m => m.invite_id))];
  const eventThreads = inviteIds.map(invId => {
    const invite = MOCK_INVITES.find(i => i.id === invId);
    const msgs = localOutMessages.filter(m => m.invite_id === invId);
    const last = msgs[msgs.length - 1];
    return { invite_id: invId, title: invite?.title || 'Out', last_message_at: last?.created_at, last_message_body: last?.body };
  });

  // DM threads
  const dmThreads = MOCK_DM_THREADS
    .filter(t => t.user_a === user.id || t.user_b === user.id)
    .map(t => {
      const otherId = t.user_a === user.id ? t.user_b : t.user_a;
      const other = MOCK_PROFILES.find(p => p.user_id === otherId);
      const msgs = localDmMessages.filter(m => m.thread_id === t.id);
      const last = msgs[msgs.length - 1];
      return { thread_id: t.id, other_display_name: other?.display_name || '', other_handle: other?.handle || '', other_avatar: other?.avatar_url, last_message_at: last?.created_at, last_message_body: last?.body };
    });

  const outMessages = selectedInviteId ? localOutMessages.filter(m => m.invite_id === selectedInviteId) : [];
  const dmMessages = selectedThreadId ? localDmMessages.filter(m => m.thread_id === selectedThreadId) : [];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (mode === 'out' && selectedInviteId) {
      setLocalOutMessages(prev => [...prev, { id: Date.now(), invite_id: selectedInviteId, sender_id: user.id, body: newMessage.trim(), created_at: new Date().toISOString() }]);
    } else if (mode === 'dm' && selectedThreadId) {
      setLocalDmMessages(prev => [...prev, { id: Date.now(), thread_id: selectedThreadId, sender_id: user.id, body: newMessage.trim(), created_at: new Date().toISOString() }]);
    }
    setNewMessage('');
  };

  const formatTime = (ts: string | null | undefined) => {
    if (!ts) return '';
    try { return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: ptBR }); } catch { return ''; }
  };

  const currentMessages = mode === 'out' ? outMessages : dmMessages;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4 bg-card rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-6">
        <div className="w-80 border-r border-border pr-4 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Eventos (Outs)</span>
                    {eventsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-2">
                  {eventThreads.map(t => (
                    <button key={t.invite_id} onClick={() => { setMode('out'); setSelectedInviteId(t.invite_id); setSelectedThreadId(null); }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${mode === 'out' && selectedInviteId === t.invite_id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                      <p className="font-medium truncate">{t.title}</p>
                      {t.last_message_body && <p className="text-sm text-muted-foreground truncate">{t.last_message_body}</p>}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={peopleOpen} onOpenChange={setPeopleOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2"><User className="w-4 h-4" />Pessoas</span>
                    {peopleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-2">
                  {dmThreads.map(t => (
                    <button key={t.thread_id} onClick={() => { setMode('dm'); setSelectedThreadId(t.thread_id); setSelectedInviteId(null); }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${mode === 'dm' && selectedThreadId === t.thread_id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10"><AvatarImage src={t.other_avatar || undefined} /><AvatarFallback>{t.other_display_name[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t.other_display_name}</p>
                          <p className="text-xs text-muted-foreground">@{t.other_handle}</p>
                          {t.last_message_body && <p className="text-sm text-muted-foreground truncate mt-1">{t.last_message_body}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedInviteId && !selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecione uma conversa</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {currentMessages.map((msg) => {
                  const isOwn = msg.sender_id === user.id;
                  const sender = MOCK_PROFILES.find(p => p.user_id === msg.sender_id);
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8"><AvatarImage src={sender?.avatar_url || undefined} /><AvatarFallback className="text-xs">{sender?.display_name?.[0] || 'U'}</AvatarFallback></Avatar>
                      <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                        <span className="text-xs font-medium">{sender?.display_name || 'Você'}</span>
                        <div className={`inline-block px-4 py-2 rounded-lg ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{msg.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t flex gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
                <Button onClick={handleSend} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
