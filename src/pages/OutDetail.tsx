import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Package, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PendingApplications } from '@/components/PendingApplications';

const OutDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const fromCalendar = searchParams.get('from') === 'calendar';
  const monthParam = searchParams.get('month');

  useEffect(() => {
    loadOut();
  }, [id]);

  const loadOut = async () => {
    const { data } = await supabase
      .from('invites')
      .select(`
        *,
        author:profiles!invites_author_id_fkey(display_name, handle, avatar_url, verified),
        hobby:hobbies(name)
      `)
      .eq('id', Number(id))
      .single();

    if (data) {
      setOut(data);
    }
    setLoading(false);
  };

  const handleApply = () => {
    setShowSecurityModal(true);
  };

  const confirmApply = async () => {
    if (!user) return;

    setApplying(true);

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          invite_id: Number(id),
          applicant_id: user.id,
          message: 'Quero participar!',
          status: 'pendente',
        });

      if (error) throw error;

      toast.success('Candidatura enviada com sucesso!');
      setShowSecurityModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar candidatura');
    } finally {
      setApplying(false);
    }
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
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!out) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Out não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {fromCalendar && (
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate(`/my-outs?tab=calendar&month=${monthParam}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Calendário
          </Button>
        )}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{out.title}</CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  {(out.hobby || out.custom_hobby) && (
                    <Badge variant="secondary">
                      {out.hobby?.name || out.custom_hobby}
                    </Badge>
                  )}
                  <Badge className="badge-mode">{getModeLabel(out.mode)}</Badge>
                </div>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                onClick={() => navigate(`/u/${out.author.handle}`)}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={out.author?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {out.author?.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{out.author?.display_name || 'Usuário'}</p>
                  {out.author?.verified && (
                    <span className="badge-verified text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {out.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{out.city}</span>
                </div>
              )}
              {out.time_label && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{out.time_label}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{out.slots_taken} / {out.slots} vagas</span>
              </div>
              {out.bring_own_materials && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>Trazer material</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-foreground">{out.description || 'Sem descrição'}</p>
            </div>

            {/* Show pending applications if user is the organizer */}
            {user && out.author_id === user.id && (
              <PendingApplications 
                inviteId={Number(id)}
                onUpdate={loadOut}
              />
            )}

            <div className="flex gap-3">
              {user && out.author_id !== user.id && (
                <Button onClick={handleApply} className="btn-primary">
                  Candidatar-se
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(`/out/${id}/chat`)}
              >
                Enviar mensagem
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aviso de Segurança</DialogTitle>
              <DialogDescription className="space-y-3 pt-4">
                {out.author?.verified ? (
                  <div className="flex items-center gap-2 text-[hsl(var(--success))]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Este perfil foi verificado.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[hsl(var(--warning))]">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Este perfil não foi verificado.</span>
                  </div>
                )}
                <p className="text-sm">
                  Recomendamos que os primeiros encontros sejam sempre em locais públicos.
                </p>
                <p className="text-sm font-medium">
                  Tenha um bom out 😉
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowSecurityModal(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmApply} disabled={applying} className="btn-primary">
                {applying ? 'Enviando...' : 'Continuar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OutDetail;
