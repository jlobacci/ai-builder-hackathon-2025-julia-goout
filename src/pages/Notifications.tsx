import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, MessageCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  read: boolean;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllNotifications();
    }
  }, [user]);

  const loadAllNotifications = async () => {
    if (!user) return;

    const allNotifications: Notification[] = [];

    // 1. Get all messages (read and unread)
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
      .limit(20);

    if (messages) {
      // Get sender names
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('v_public_profiles')
        .select('user_id, display_name')
        .in('user_id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      for (const msg of messages) {
        const { count } = await supabase
          .from('message_reads')
          .select('*', { count: 'exact', head: true })
          .eq('message_id', msg.id)
          .eq('user_id', user.id);

        allNotifications.push({
          id: `msg-${msg.id}`,
          type: 'message',
          icon: '💬',
          title: `${count === 0 ? 'Nova mensagem' : 'Mensagem'} de ${profileMap.get(msg.sender_id) || 'Usuário'}`,
          body: msg.body.substring(0, 100) + (msg.body.length > 100 ? '...' : ''),
          time: new Date(msg.created_at),
          link: `/out/${msg.invite_id}/chat`,
          read: count > 0
        });
      }
    }

    // 2. Get all upcoming events
    const now = new Date();
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        invite_id,
        status,
        created_at,
        invite:invites(
          id,
          title,
          invite_slots(date, start_time)
        )
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    if (applications) {
      for (const app of applications) {
        const slots = app.invite?.invite_slots || [];
        for (const slot of slots) {
          const slotDate = new Date(slot.date + 'T' + slot.start_time);
          const hoursUntil = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursUntil > -24) { // Show events from last 24h and future
            allNotifications.push({
              id: `event-${app.invite_id}-${slot.date}`,
              type: 'event',
              icon: '📅',
              title: `Out "${app.invite?.title}"`,
              body: hoursUntil > 0 
                ? `Começando ${formatDistanceToNow(slotDate, { locale: ptBR, addSuffix: true })}`
                : `Aconteceu ${formatDistanceToNow(slotDate, { locale: ptBR, addSuffix: true })}`,
              time: slotDate,
              link: `/out/${app.invite_id}`,
              read: hoursUntil < 0
            });
          }
        }
      }
    }

    // Sort by time
    allNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());
    
    setNotifications(allNotifications);
    setLoading(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    navigate(notification.link);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Notificações</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer hover:bg-accent transition-colors ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.body}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.time, { locale: ptBR, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;