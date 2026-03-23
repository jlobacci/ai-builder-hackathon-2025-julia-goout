import React from 'react';
import { MOCK_APPLICATIONS, MOCK_PROFILES } from '@/lib/mock-data';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PendingApplicationsProps {
  inviteId: number;
  onUpdate?: () => void;
}

export const PendingApplications: React.FC<PendingApplicationsProps> = ({ inviteId }) => {
  const pendingApps = MOCK_APPLICATIONS.filter(a => a.invite_id === inviteId && a.status === 'pendente');

  if (pendingApps.length === 0) return null;

  return (
    <div className="space-y-3 pt-3 border-t">
      <p className="text-sm font-medium text-muted-foreground">Solicitações pendentes ({pendingApps.length})</p>
      {pendingApps.map((app) => {
        const profile = MOCK_PROFILES.find(p => p.user_id === app.applicant_id);
        return (
          <div key={app.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{profile?.display_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.display_name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground truncate">@{profile?.handle || 'desconhecido'}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" onClick={() => toast.success('Pedido aceito!')} className="h-8 px-3"><Check className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => toast.success('Pedido recusado')} className="h-8 px-3"><X className="w-4 h-4" /></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
