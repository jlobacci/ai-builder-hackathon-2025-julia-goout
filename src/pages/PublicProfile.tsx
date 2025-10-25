import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const PublicProfile: React.FC = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [handle]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleViewOuts = () => {
    // Filter outs by this author
    navigate('/outs');
  };

  const handleLeaveComment = () => {
    toast('Em breve', {
      description: 'A funcionalidade de comentários estará disponível em breve.',
    });
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

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Perfil não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                  {profile.verified && (
                    <span className="badge-verified">
                      <CheckCircle className="w-4 h-4" />
                      Verificado
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">@{profile.handle}</p>

                {(profile.city || profile.state || profile.country) && (
                  <div className="flex items-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[profile.city, profile.state, profile.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-foreground mb-4">{profile.bio}</p>
                )}

                <Button onClick={handleViewOuts} className="btn-primary">
                  Ver Outs deste perfil
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experiências</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic">
              Nenhuma experiência adicionada ainda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">
              Nenhuma recomendação ainda.
            </p>
            <Button onClick={handleLeaveComment} variant="outline">
              Deixe um comentário
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PublicProfile;
