import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const MyOuts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createdOuts, setCreatedOuts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: created } = await supabase
      .from('invites')
      .select(`
        *,
        hobby:hobbies(name)
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
          hobby:hobbies(name)
        )
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    if (created) setCreatedOuts(created);
    if (apps) setApplications(apps);
    setLoading(false);
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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meus Outs</h1>

        <Tabs defaultValue="created">
          <TabsList className="mb-6">
            <TabsTrigger value="created">Criados por mim</TabsTrigger>
            <TabsTrigger value="applications">Minhas candidaturas</TabsTrigger>
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
                      <CardTitle className="text-xl">{out.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {out.hobby && (
                          <Badge variant="secondary">{out.hobby.name}</Badge>
                        )}
                        <Badge className="badge-mode">{getModeLabel(out.mode)}</Badge>
                      </div>
                      {out.city && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {out.city}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => navigate(`/out/${out.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        Ver detalhes
                      </Button>
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
                      <CardTitle className="text-xl">{app.invite.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {app.invite.hobby && (
                          <Badge variant="secondary">{app.invite.hobby.name}</Badge>
                        )}
                        <Badge className="badge-mode">{getModeLabel(app.invite.mode)}</Badge>
                        <Badge variant={app.status === 'aceito' ? 'default' : 'secondary'}>
                          {getStatusLabel(app.status)}
                        </Badge>
                      </div>
                      {app.invite.city && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {app.invite.city}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => navigate(`/out/${app.invite.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        Ver Out
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyOuts;
