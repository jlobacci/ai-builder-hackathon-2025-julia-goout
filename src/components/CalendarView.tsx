import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<CalendarSlot[]>([]);

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
    return slots.filter(s => s.date === dateString);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={previousMonth} variant="outline" size="icon">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
        <Button onClick={nextMonth} variant="outline" size="icon">
          <ChevronRight className="w-4 h-4" />
        </Button>
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
              className={`min-h-24 p-2 border rounded-lg ${
                !date ? 'bg-muted/30' : isToday ? 'border-primary bg-primary/5' : 'bg-background'
              }`}
            >
              {date && (
                <>
                  <div className="text-sm font-medium mb-1">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {daySlots.map((slot) => (
                      <TooltipProvider key={slot.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={
                                slot.isAuthor
                                  ? 'default'
                                  : slot.applicationStatus === 'aceito'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={`w-full text-xs cursor-pointer ${
                                slot.isAuthor
                                  ? 'bg-primary hover:bg-primary/80'
                                  : slot.applicationStatus === 'aceito'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-gray-500 hover:bg-gray-600'
                              }`}
                              onClick={() => navigate(`/out/${slot.invite.id}`)}
                            >
                              {slot.start_time.substring(0, 5)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{slot.invite.title}</p>
                              <p className="text-xs">
                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                              </p>
                              <p className="text-xs">
                                {slot.isAuthor 
                                  ? 'Autor' 
                                  : slot.applicationStatus === 'aceito'
                                  ? 'Aceita'
                                  : 'Pendente'
                                }
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
