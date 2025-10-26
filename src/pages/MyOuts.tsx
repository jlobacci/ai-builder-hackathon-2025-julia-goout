import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Edit, MessageCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { OutMessagesBlock } from '@/components/OutMessagesBlock';
import { CalendarView } from '@/components/CalendarView';

const MyOuts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [createdOuts, setCreatedOuts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOuts, setExpandedOuts] = useState<Set<number>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  
  const defaultTab = searchParams.get('tab') === 'calendar' ? 'calendar' : 'created';

  useEffect(() => {
    if (user) {
      loadData();
      loadUnreadCounts();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: created } = await supabase
      .from('invites')
      .select(`
        *,
        hobby:hobbies(name),
        invite_slots(date, start_time, end_time)
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    const { data: apps } = await supabase
      .from('applications')
      .select(`
        *,
        invite:invites(
          id,
          title,
          city,
          mode,
          author_id,
          hobby:hobbies(name),
          invite_slots(date, start_time, end_time)
        )
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    if (created) setCreatedOuts(created);
    if (apps) setApplications(apps);
    setLoading(false);
  };

  const loadUnreadCounts = async () => {
    if (!user) return;

    // Get all invite IDs for the user (created + applied)
    const { data: created } = await supabase
      .from('invites')
      .select('id')
      .eq('author_id', user.id);

    const { data: apps } = await supabase
      .from('applications')
      .select('invite_id')
      .eq('applicant_id', user.id);

    const inviteIds = [
      ...(created?.map(i => i.id) || []),
      ...(apps?.map(a => a.invite_id) || [])
    ];

    if (inviteIds.length === 0) return;

    // Count unread messages for each invite
    const counts: Record<number, number> = {};
    
    for (const inviteId of inviteIds) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('invite_id', inviteId)
        .neq('sender_id', user.id)
        .not('id', 'in', 
          `(select message_id from message_reads where user_id = '${user.id}')`
        );
      
      if (count && count > 0) {
        counts[inviteId] = count;
      }
    }

    setUnreadCounts(counts);
  };

  const toggleExpanded = (outId: number) => {
    const newExpanded = new Set(expandedOuts);
    if (newExpanded.has(outId)) {
      newExpanded.delete(outId);
    } else {
      newExpanded.add(outId);
    }
    setExpandedOuts(newExpanded);
  };

  const getModeLabel = (mode: string) => {
    const labels = {
      presencial: 'Presencial',
      online: 'Online',
      hibrido: 'Híbrido'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      rejeitado: 'Rejeitado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getNextSlot = (slots: any[]) => {
    if (!slots || slots.length === 0) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const futureSlots = slots.filter(s => s.date >= today);
    
    if (futureSlots.length === 0) return null;
    
    futureSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
    
    return futureSlots[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meus Outs</h1>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="created">
              Criados por mim
              {Object.keys(unreadCounts).filter(k => 
                createdOuts.some(o => o.id === Number(k))
              ).length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {Object.keys(unreadCounts).filter(k => 
                    createdOuts.some(o => o.id === Number(k))
                  ).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">
              Minhas candidaturas
              {Object.keys(unreadCounts).filter(k => 
                applications.some(a => a.invite?.id === Number(k))
              ).length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {Object.keys(unreadCounts).filter(k => 
                    applications.some(a => a.invite?.id === Number(k))
                  ).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="created">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : createdOuts.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Você ainda não criou nenhum Out
              </p>
            ) : (
              <div className="grid gap-4">
                {createdOuts.map((out) => (
                  <Card key={out.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{out.title}</CardTitle>
                            {unreadCounts[out.id] && (
                              <Badge variant="destructive" className="h-5 px-2">
                                • {unreadCounts[out.id]} nova{unreadCounts[out.id] > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {(out.hobby || out.custom_hobby) && (
                              <Badge variant="secondary">
                                {out.hobby?.name || out.custom_hobby}
                              </Badge>
                            )}
                            <Badge className="badge-mode">{getModeLabel(out.mode)}</Badge>
                          </div>
                          <div className="space-y-1 mt-2">
                            {out.city && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {out.city}
                              </div>
                            )}
                            {getNextSlot(out.invite_slots) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {formatDate(getNextSlot(out.invite_slots).date)} às {getNextSlot(out.invite_slots).start_time.substring(0, 5)}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate(`/out/${out.id}/edit`)}
                          variant="ghost"
                          size="icon"
                          title="Editar Out"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/out/${out.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          Ver detalhes
                        </Button>
                        <Button
                          onClick={() => toggleExpanded(out.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Mensagens
                          {expandedOuts.has(out.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => navigate(`/messages?invite_id=${out.id}`)}
                          variant="ghost"
                          size="sm"
                        >
                          Ver todas
                        </Button>
                      </div>

                      {expandedOuts.has(out.id) && (
                        <OutMessagesBlock
                          inviteId={out.id}
                          onUnreadUpdate={() => loadUnreadCounts()}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : applications.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Você ainda não se candidatou a nenhum Out
              </p>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{app.invite.title}</CardTitle>
                        {unreadCounts[app.invite.id] && (
                          <Badge variant="destructive" className="h-5 px-2">
                            • {unreadCounts[app.invite.id]} nova{unreadCounts[app.invite.id] > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(app.invite.hobby || app.invite.custom_hobby) && (
                          <Badge variant="secondary">
                            {app.invite.hobby?.name || app.invite.custom_hobby}
                          </Badge>
                        )}
                        <Badge className="badge-mode">{getModeLabel(app.invite.mode)}</Badge>
                        <Badge variant={app.status === 'aceito' ? 'default' : 'secondary'}>
                          {getStatusLabel(app.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {app.invite.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {app.invite.city}
                          </div>
                        )}
                        {getNextSlot(app.invite.invite_slots) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(getNextSlot(app.invite.invite_slots).date)} às {getNextSlot(app.invite.invite_slots).start_time.substring(0, 5)}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/out/${app.invite.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          Ver Out
                        </Button>
                        <Button
                          onClick={() => toggleExpanded(app.invite.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Mensagens
                          {expandedOuts.has(app.invite.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => navigate(`/messages?invite_id=${app.invite.id}`)}
                          variant="ghost"
                          size="sm"
                        >
                          Ver todas
                        </Button>
                      </div>

                      {expandedOuts.has(app.invite.id) && (
                        <OutMessagesBlock
                          inviteId={app.invite.id}
                          onUnreadUpdate={() => loadUnreadCounts()}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyOuts;
