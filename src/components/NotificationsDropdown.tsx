import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const badgeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      // Clear badge after 3 seconds when dropdown is opened
      badgeTimeoutRef.current = setTimeout(() => {
        setUnreadCount(0);
      }, 3000);
    }
    return () => {
      if (badgeTimeoutRef.current) {
        clearTimeout(badgeTimeoutRef.current);
      }
    };
  }, [isOpen, unreadCount]);

  const loadNotifications = async () => {
    if (!user) return;

    const allNotifications: Notification[] = [];

    // 1. Get unread messages
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        id,
        body,
        created_at,
        sender_id,
        invite_id
      `)
      .neq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (messages) {
      // Get sender names
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('v_public_profiles')
        .select('user_id, display_name')
        .in('user_id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      // Check which messages are unread
      for (const msg of messages) {
        const { count } = await supabase
          .from('message_reads')
          .select('*', { count: 'exact', head: true })
          .eq('message_id', msg.id)
          .eq('user_id', user.id);

        if (count === 0) {
          allNotifications.push({
            id: `msg-${msg.id}`,
            type: 'message',
            icon: '💬',
            title: `Nova mensagem de ${profileMap.get(msg.sender_id) || 'Usuário'}`,
            body: msg.body.substring(0, 50) + (msg.body.length > 50 ? '...' : ''),
            time: new Date(msg.created_at),
            link: `/out/${msg.invite_id}/chat`
          });
        }
      }
    }

    // 2. Get upcoming events (next 24 hours)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const today = now.toISOString().split('T')[0];
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    // Get accepted applications
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        invite_id,
        status,
        invite:invites(
          id,
          title,
          invite_slots(date, start_time)
        )
      `)
      .eq('applicant_id', user.id)
      .eq('status', 'aceito');

    if (applications) {
      for (const app of applications) {
        const slots = app.invite?.invite_slots || [];
        for (const slot of slots) {
          const slotDate = new Date(slot.date + 'T' + slot.start_time);
          const hoursUntil = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursUntil > 0 && hoursUntil <= 24) {
            allNotifications.push({
              id: `event-${app.invite_id}-${slot.date}`,
              type: 'event',
              icon: '📅',
              title: `Seu Out "${app.invite?.title}" começa em breve`,
              body: `Começando ${formatDistanceToNow(slotDate, { locale: ptBR, addSuffix: true })}`,
              time: slotDate,
              link: `/out/${app.invite_id}`
            });
          }
        }
      }
    }

    // Sort by time and limit to 5
    allNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());
    const recentNotifications = allNotifications.slice(0, 5);
    
    setNotifications(recentNotifications);
    setUnreadCount(allNotifications.length);
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    navigate(notification.link);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-card z-50"
        style={{
          animation: 'fadeIn 200ms ease-in-out'
        }}
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação nova</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="w-full p-4 text-left hover:bg-accent transition-colors border-b last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{notification.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.time, { locale: ptBR, addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                navigate('/notificacoes');
              }}
            >
              Ver todas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};