import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MESSAGES, MOCK_PROFILES, MOCK_APPLICATIONS, MOCK_INVITE_SLOTS } from '@/lib/mock-data';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'message' | 'event';
  icon: string;
  title: string;
  body: string;
  time: Date;
  link: string;
}

export const NotificationsDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const notifications: Notification[] = [];

  // Messages not from me
  const unreadMessages = MOCK_MESSAGES.filter(m => m.sender_id !== user.id).slice(0, 5);
  for (const msg of unreadMessages) {
    const sender = MOCK_PROFILES.find(p => p.user_id === msg.sender_id);
    notifications.push({
      id: `msg-${msg.id}`,
      type: 'message',
      icon: '💬',
      title: `Nova mensagem de ${sender?.display_name || 'Usuário'}`,
      body: msg.body.substring(0, 50) + (msg.body.length > 50 ? '...' : ''),
      time: new Date(msg.created_at),
      link: `/out/${msg.invite_id}/chat`,
    });
  }

  notifications.sort((a, b) => b.time.getTime() - a.time.getTime());
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {recentNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
              {recentNotifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-card z-50">
        <div className="p-4 border-b"><h3 className="font-semibold">Notificações</h3></div>
        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação nova</p>
            </div>
          ) : (
            recentNotifications.map((n) => (
              <button key={n.id} onClick={() => { setIsOpen(false); navigate(n.link); }}
                className="w-full p-4 text-left hover:bg-accent transition-colors border-b last:border-b-0">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(n.time, { locale: ptBR, addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        {recentNotifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="ghost" className="w-full" onClick={() => { setIsOpen(false); navigate('/notificacoes'); }}>
              Ver todas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
