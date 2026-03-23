import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MESSAGES, MOCK_PROFILES } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, MessageCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const notifications = MOCK_MESSAGES
    .filter(m => m.sender_id !== user.id)
    .map(msg => {
      const sender = MOCK_PROFILES.find(p => p.user_id === msg.sender_id);
      return {
        id: `msg-${msg.id}`, type: 'message' as const, icon: '💬',
        title: `Mensagem de ${sender?.display_name || 'Usuário'}`,
        body: msg.body.substring(0, 100),
        time: new Date(msg.created_at),
        link: `/out/${msg.invite_id}/chat`, read: false,
      };
    })
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6"><Bell className="w-8 h-8 text-primary" /><h1 className="text-3xl font-bold">Notificações</h1></div>
        {notifications.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhuma notificação</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card key={n.id} className="cursor-pointer hover:bg-accent transition-colors border-primary/50 bg-primary/5" onClick={() => navigate(n.link)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600"><MessageCircle className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary">{n.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{n.body}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(n.time, { locale: ptBR, addSuffix: true })}</p>
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
