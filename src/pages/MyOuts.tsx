import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_INVITES, MOCK_HOBBIES, MOCK_APPLICATIONS, MOCK_INVITE_SLOTS } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Edit, MessageCircle } from 'lucide-react';
import { OutMessagesBlock } from '@/components/OutMessagesBlock';
import { CalendarView } from '@/components/CalendarView';
import { PendingApplications } from '@/components/PendingApplications';
import { useState } from 'react';

const MyOuts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedOuts, setExpandedOuts] = useState<Set<number>>(new Set());
  const defaultTab = searchParams.get('tab') === 'calendar' ? 'calendar' : 'created';

  if (!user) return null;

  const createdOuts = MOCK_INVITES.filter(i => i.author_id === user.id).map(inv => {
    const hobby = MOCK_HOBBIES.find(h => h.id === inv.hobby_id);
    return { ...inv, hobby: hobby ? { name: hobby.name } : null };
  });

  const applications = MOCK_APPLICATIONS.filter(a => a.applicant_id === user.id).map(app => {
    const invite = MOCK_INVITES.find(i => i.id === app.invite_id);
    const hobby = invite ? MOCK_HOBBIES.find(h => h.id === invite.hobby_id) : null;
    return { ...app, invite: invite ? { ...invite, hobby: hobby ? { name: hobby.name } : null } : null };
  });

  const getModeLabel = (mode: string) => ({ presencial: 'Presencial', online: 'Online', hibrido: 'Híbrido' }[mode] || mode);
  const getStatusLabel = (status: string) => ({ pendente: 'Pendente', aceito: 'Aceito', rejeitado: 'Rejeitado' }[status] || status);
  const toggleExpanded = (id: number) => { const s = new Set(expandedOuts); s.has(id) ? s.delete(id) : s.add(id); setExpandedOuts(s); };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meus Outs</h1>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="created">Criados por mim</TabsTrigger>
            <TabsTrigger value="applications">Minhas candidaturas</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>
          <TabsContent value="created">
            {createdOuts.length === 0 ? <p className="text-center text-muted-foreground">Você ainda não criou nenhum Out</p> : (
              <div className="grid gap-4">
                {createdOuts.map((out) => (
                  <Card key={out.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{out.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {out.hobby && <Badge variant="secondary">{out.hobby.name}</Badge>}
                            <Badge className="badge-mode">{getModeLabel(out.mode)}</Badge>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/out/${out.id}/edit`)} variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <PendingApplications inviteId={out.id} />
                      <div className="flex gap-2">
                        <Button onClick={() => navigate(`/out/${out.id}`)} variant="outline" size="sm">Ver detalhes</Button>
                        <Button onClick={() => toggleExpanded(out.id)} variant="outline" size="sm" className="gap-2"><MessageCircle className="w-4 h-4" />Mensagens</Button>
                      </div>
                      {expandedOuts.has(out.id) && <OutMessagesBlock inviteId={out.id} />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="applications">
            {applications.length === 0 ? <p className="text-center text-muted-foreground">Nenhuma candidatura</p> : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{app.invite?.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {app.invite?.hobby && <Badge variant="secondary">{app.invite.hobby.name}</Badge>}
                        <Badge variant={app.status === 'aceito' ? 'default' : 'secondary'}>{getStatusLabel(app.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => navigate(`/out/${app.invite_id}`)} variant="outline" size="sm">Ver Out</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="calendar"><CalendarView /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyOuts;
