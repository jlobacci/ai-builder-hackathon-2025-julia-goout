import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PendingApplication {
  id: number;
  applicant_id: string;
  status: string;
  message?: string;
  profiles?: {
    display_name: string;
    handle: string;
    avatar_url?: string;
  };
}

interface PendingApplicationsProps {
  inviteId: number;
  onUpdate?: () => void;
}

export const PendingApplications: React.FC<PendingApplicationsProps> = ({ inviteId, onUpdate }) => {
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadApplications();
    // Poll every 15 seconds
    const interval = setInterval(loadApplications, 15000);
    return () => clearInterval(interval);
  }, [inviteId]);

  const loadApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select(`
        id,
        applicant_id,
        status,
        message,
        profiles:v_public_profiles!applications_applicant_id_fkey(
          display_name,
          handle,
          avatar_url
        )
      `)
      .eq('invite_id', inviteId)
      .eq('status', 'pendente')
      .order('created_at', { ascending: true });

    if (data) {
      setApplications(data as any);
    }
    setLoading(false);
  };

  const handleAccept = async (applicationId: number) => {
    setProcessing(applicationId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'aceito' })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Pedido aceito!');
      await loadApplications();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aceitar pedido');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: number) => {
    setProcessing(applicationId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejeitado' })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Pedido recusado');
      await loadApplications();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao recusar pedido');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (applications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      <p className="text-sm font-medium text-muted-foreground">
        Solicitações pendentes ({applications.length})
      </p>
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/50"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={app.profiles?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {app.profiles?.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {app.profiles?.display_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{app.profiles?.handle || 'desconhecido'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => handleAccept(app.id)}
              disabled={processing !== null}
              className="h-8 px-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
            >
              {processing === app.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(app.id)}
              disabled={processing !== null}
              className="h-8 px-3 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
            >
              {processing === app.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
