import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

interface UpcomingEvent {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  invite_id: number;
  invite: {
    id: number;
    title: string;
    city: string;
    mode: string;
    author_id: string;
  };
  isAuthor: boolean;
  applicationStatus?: string;
}

export const UpcomingEvents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUpcomingEvents();
      // Auto-refresh every 60 seconds
      const interval = setInterval(loadUpcomingEvents, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUpcomingEvents = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Get slots for Outs created by user (as organizer)
    const { data: authorSlots } = await supabase
      .from('invite_slots')
      .select(`
        *,
        invite:invites(id, title, city, mode, author_id)
      `)
      .gte('date', today)
      .eq('invite.author_id', user.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(10);

    // Get applications with accepted status
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        status,
        invite_id,
        invite:invites(id, title, city, mode, author_id)
      `)
      .eq('applicant_id', user.id)
      .eq('status', 'aceito');

    const appliedInviteIds = applications?.map(a => a.invite_id) || [];

    // Get slots for Outs user applied to (as applicant)
    let applicantSlots: any[] = [];
    if (appliedInviteIds.length > 0) {
      const { data } = await supabase
        .from('invite_slots')
        .select(`
          *,
          invite:invites(id, title, city, mode, author_id)
        `)
        .gte('date', today)
        .in('invite_id', appliedInviteIds)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(10);

      applicantSlots = data || [];
    }

    // Combine and mark slots with role badge
    const allSlots: UpcomingEvent[] = [
      ...(authorSlots?.map(s => ({
        ...s,
        isAuthor: true
      })) || []),
      ...(applicantSlots.map(s => {
        const app = applications?.find(a => a.invite_id === s.invite_id);
        return {
          ...s,
          isAuthor: false,
          applicationStatus: app?.status
        };
      }) || [])
    ];

    // Sort by date and time
    allSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });

    // Filter out events with null invites (deleted invites) and take top 3
    const validEvents = allSlots.filter(e => e.invite !== null);
    
    setEvents(validEvents.slice(0, 3));
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getModeLabel = (mode: string) => {
    const labels = {
      presencial: 'Presencial',
      online: 'Online',
      hibrido: 'Híbrido'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/out/${event.invite.id}`)}
            className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm line-clamp-1">
                {event.invite.title}
              </h4>
              {event.isAuthor ? (
                <Badge variant="secondary" className="text-xs shrink-0">Organizador</Badge>
              ) : (
                <Badge className="text-xs shrink-0 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90">Candidato</Badge>
              )}
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</span>
              </div>
              
              {event.invite.mode === 'presencial' && event.invite.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event.invite.city}</span>
                </div>
              )}
              
              {event.invite.mode !== 'presencial' && (
                <Badge variant="outline" className="text-xs mt-1">
                  {getModeLabel(event.invite.mode)}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};