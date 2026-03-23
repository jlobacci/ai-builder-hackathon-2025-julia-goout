import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_INVITE_SLOTS, MOCK_INVITES, MOCK_APPLICATIONS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getInitialDate = () => {
    const monthParam = searchParams.get('month');
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [filters, setFilters] = useState({ author: true, accepted: true, pending: true });

  if (!user) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
  const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const myInviteIds = MOCK_INVITES.filter(i => i.author_id === user.id).map(i => i.id);
  const myApps = MOCK_APPLICATIONS.filter(a => a.applicant_id === user.id);
  const appliedInviteIds = myApps.map(a => a.invite_id);

  const slots = MOCK_INVITE_SLOTS
    .filter(s => s.date >= firstDay && s.date <= lastDay && (myInviteIds.includes(s.invite_id) || appliedInviteIds.includes(s.invite_id)))
    .map(s => {
      const invite = MOCK_INVITES.find(i => i.id === s.invite_id);
      const isAuthor = invite ? invite.author_id === user.id : false;
      const app = myApps.find(a => a.invite_id === s.invite_id);
      return { ...s, invite, isAuthor, applicationStatus: app?.status };
    });

  const getDaysInMonth = () => {
    const firstDayObj = new Date(year, month, 1);
    const lastDayObj = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayObj.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDayObj.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return slots.filter(s => {
      if (s.date !== dateString || !s.invite) return false;
      if (s.isAuthor && !filters.author) return false;
      if (!s.isAuthor && s.applicationStatus === 'aceito' && !filters.accepted) return false;
      if (!s.isAuthor && s.applicationStatus !== 'aceito' && !filters.pending) return false;
      return true;
    });
  };

  const updateMonth = (newDate: Date) => {
    setCurrentDate(newDate);
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    setSearchParams({ tab: 'calendar', month: `${y}-${m}` });
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => updateMonth(new Date(year, month - 1, 1))} variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /> Mês anterior</Button>
            <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
            <Button onClick={() => updateMonth(new Date(year, month + 1, 1))} variant="outline" size="sm">Próximo mês <ChevronRight className="w-4 h-4" /></Button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">{day}</div>
            ))}
            {days.map((date, index) => {
              const daySlots = getSlotsForDate(date);
              const isToday = date?.toDateString() === new Date().toDateString();
              return (
                <div key={index} className={`min-h-32 p-2 border rounded-lg ${!date ? 'bg-muted/30' : isToday ? 'border-primary border-2 bg-primary/5' : 'bg-background'}`}>
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>{date.getDate()}</div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {daySlots.slice(0, 3).map((slot) => (
                          <div key={slot.id}
                            className="p-1.5 cursor-pointer hover:shadow-sm transition-shadow rounded border-l-4 bg-background"
                            style={{ borderLeftColor: slot.isAuthor ? '#B6463A' : slot.applicationStatus === 'aceito' ? '#16A34A' : '#D0D5DD' }}
                            onClick={() => navigate(`/out/${slot.invite?.id}`)}>
                            <p className="text-xs font-medium truncate">{slot.invite?.title}</p>
                            <p className="text-xs text-muted-foreground">{slot.start_time}–{slot.end_time}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
