import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_INVITE_SLOTS, MOCK_INVITES, MOCK_APPLICATIONS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

export const UpcomingEvents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  // Get slots for outs authored by user or where user is accepted applicant
  const myInviteIds = MOCK_INVITES.filter(i => i.author_id === user.id).map(i => i.id);
  const acceptedInviteIds = MOCK_APPLICATIONS
    .filter(a => a.applicant_id === user.id && a.status === 'aceito')
    .map(a => a.invite_id);

  const relevantSlots = MOCK_INVITE_SLOTS
    .filter(s => s.date >= today && (myInviteIds.includes(s.invite_id) || acceptedInviteIds.includes(s.invite_id)))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
    .slice(0, 3);

  if (relevantSlots.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {relevantSlots.map((slot) => {
          const invite = MOCK_INVITES.find(i => i.id === slot.invite_id);
          if (!invite) return null;
          const isAuthor = invite.author_id === user.id;
          return (
            <div key={slot.id} onClick={() => navigate(`/out/${invite.id}`)}
              className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm line-clamp-1">{invite.title}</h4>
                <Badge variant={isAuthor ? 'secondary' : 'default'} className="text-xs shrink-0">
                  {isAuthor ? 'Organizador' : 'Candidato'}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /><span>{formatDate(slot.date)}</span></div>
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /><span>{slot.start_time} - {slot.end_time}</span></div>
                {invite.city && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /><span>{invite.city}</span></div>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
