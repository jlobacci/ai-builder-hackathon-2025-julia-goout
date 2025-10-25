import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface CalendarSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  invite_id: number;
  invite: {
    id: number;
    title: string;
    author_id: string;
  };
  isAuthor: boolean;
  applicationStatus?: string;
}

export const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL param or current date
  const getInitialDate = () => {
    const monthParam = searchParams.get('month');
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [filters, setFilters] = useState({
    author: true,
    accepted: true,
    pending: true
  });

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (user) {
      loadSlots();
    }
  }, [user, currentDate]);

  const loadSlots = async () => {
    if (!user) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

    // Get slots for Outs created by user
    const { data: authorSlots } = await supabase
      .from('invite_slots')
      .select(`
        *,
        invite:invites(id, title, author_id)
      `)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .eq('invite.author_id', user.id);

    // Get slots for Outs user applied to
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        status,
        invite_id,
        invite:invites(id, title, author_id)
      `)
      .eq('applicant_id', user.id);

    const appliedInviteIds = applications?.map(a => a.invite_id) || [];

    let applicantSlots: any[] = [];
    if (appliedInviteIds.length > 0) {
      const { data } = await supabase
        .from('invite_slots')
        .select(`
          *,
          invite:invites(id, title, author_id)
        `)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('invite_id', appliedInviteIds);

      applicantSlots = data || [];
    }

    // Combine and mark slots
    const allSlots: CalendarSlot[] = [
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

    setSlots(allSlots);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return slots.filter(s => {
      if (s.date !== dateString) return false;
      
      // Filter out slots without valid invite data
      if (!s.invite || !s.invite.title) return false;
      
      // Apply filters
      if (s.isAuthor && !filters.author) return false;
      if (!s.isAuthor && s.applicationStatus === 'aceito' && !filters.accepted) return false;
      if (!s.isAuthor && s.applicationStatus !== 'aceito' && !filters.pending) return false;
      
      return true;
    });
  };

  const updateMonth = (newDate: Date) => {
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    setSearchParams({ tab: 'calendar', month: `${year}-${month}` });
  };

  const previousMonth = () => {
    updateMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    updateMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleEventClick = (inviteId: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    navigate(`/out/${inviteId}?from=calendar&month=${year}-${month}`);
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
        <Button onClick={previousMonth} variant="outline" size="sm" className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Mês anterior
        </Button>
        <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
        <Button onClick={nextMonth} variant="outline" size="sm" className="gap-2">
          Próximo mês
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend with filters */}
      <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
        
        <button
          onClick={() => toggleFilter('author')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
            filters.author 
              ? 'bg-[#B6463A] text-white shadow-sm' 
              : 'bg-background text-muted-foreground border'
          }`}
        >
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#B6463A' }} />
          <span className="text-sm">Criados por mim</span>
        </button>

        <button
          onClick={() => toggleFilter('accepted')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
            filters.accepted 
              ? 'bg-[#16A34A] text-white shadow-sm' 
              : 'bg-background text-muted-foreground border'
          }`}
        >
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16A34A' }} />
          <span className="text-sm">Aceitos</span>
        </button>

        <button
          onClick={() => toggleFilter('pending')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
            filters.pending 
              ? 'bg-[#D0D5DD] text-foreground shadow-sm' 
              : 'bg-background text-muted-foreground border'
          }`}
        >
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#D0D5DD' }} />
          <span className="text-sm">Pendentes</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const daySlots = getSlotsForDate(date);
          const isToday = date?.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`min-h-32 p-2 border rounded-lg ${
                !date 
                  ? 'bg-muted/30' 
                  : isToday 
                  ? 'border-primary border-2 bg-primary/5' 
                  : 'bg-background'
              }`}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {daySlots.slice(0, 3).map((slot) => (
                      slot.invite && slot.invite.title ? (
                        <div
                          key={slot.id}
                          className="p-1.5 cursor-pointer hover:shadow-sm transition-shadow rounded border-l-4 bg-background"
                          style={{
                            borderLeftColor: slot.isAuthor 
                              ? '#B6463A' 
                              : slot.applicationStatus === 'aceito'
                              ? '#16A34A'
                              : '#D0D5DD'
                          }}
                          onClick={() => handleEventClick(slot.invite.id)}
                          title={`${slot.invite.title} — ${slot.start_time.substring(0, 5)}–${slot.end_time.substring(0, 5)} — clique para ver detalhes`}
                        >
                          <p className="text-xs font-medium truncate leading-tight">
                            {slot.invite.title}
                          </p>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {slot.start_time.substring(0, 5)}–{slot.end_time.substring(0, 5)}
                          </p>
                        </div>
                      ) : null
                    ))}
                    {daySlots.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{daySlots.length - 3} mais
                      </p>
                    )}
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
