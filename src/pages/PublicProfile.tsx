import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_PROFILES, MOCK_USER_HOBBIES, MOCK_HOBBIES, MOCK_INVITES, MOCK_CONNECTIONS, MOCK_POSTS, MOCK_POST_COMMENTS } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, MapPin, MessageCircle, UserPlus, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { PostCard, type Post } from '@/components/PostCard';

const PublicProfile: React.FC = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Determine which profile to show
  let profile;
  if (!handle && user) {
    profile = MOCK_PROFILES.find(p => p.user_id === user.id);
  } else if (handle) {
    profile = MOCK_PROFILES.find(p => p.handle === handle);
  }

  if (!profile) {
    return <Layout><div className="max-w-6xl mx-auto p-4"><p className="text-center text-muted-foreground">Perfil não encontrado</p></div></Layout>;
  }

  const isOwnProfile = user?.id === profile.user_id;
  const hobbies = MOCK_USER_HOBBIES.filter(uh => uh.user_id === profile.user_id);
  const outs = MOCK_INVITES.filter(i => i.author_id === profile.user_id);
  
  // Connections
  const acceptedConnections = MOCK_CONNECTIONS
    .filter(c => c.status === 'aceita' && (c.requester_id === profile.user_id || c.target_id === profile.user_id))
    .map(c => {
      const otherId = c.requester_id === profile.user_id ? c.target_id : c.requester_id;
      return MOCK_PROFILES.find(p => p.user_id === otherId);
    })
    .filter(Boolean);

  const pendingRequests = isOwnProfile 
    ? MOCK_CONNECTIONS.filter(c => c.target_id === profile.user_id && c.status === 'pendente').map(c => {
        const requester = MOCK_PROFILES.find(p => p.user_id === c.requester_id);
        return { ...c, requester_profile: requester };
      })
    : [];

  // Connection with current user
  const connection = user && !isOwnProfile
    ? MOCK_CONNECTIONS.find(c => 
        (c.requester_id === user.id && c.target_id === profile.user_id) ||
        (c.requester_id === profile.user_id && c.target_id === user.id))
    : null;

  // Posts
  const posts: Post[] = MOCK_POSTS.filter(p => p.author_id === profile.user_id);

  const handleLike = (postId: number, liked: boolean) => toast.info('Curtida registrada (demo)');
  const handleCommentClick = () => toast.info('Para comentar, visite o feed');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Left sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl">{profile.display_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                      {profile.verified && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    <p className="text-muted-foreground mb-3">@{profile.handle}</p>
                    {(profile.city || profile.state) && (
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" /><span>{[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {!isOwnProfile && user && (
                    <div className="w-full space-y-2">
                      {!connection && <Button onClick={() => toast.success('Convite enviado (demo)')} className="w-full" size="sm"><UserPlus className="w-4 h-4 mr-2" />Se conectar</Button>}
                      {connection?.status === 'aceita' && (
                        <>
                          <Badge className="w-full justify-center py-2 bg-green-600"><UserCheck className="w-4 h-4 mr-2" />Conectado</Badge>
                          <Button onClick={() => navigate(`/messages?person_id=${profile.user_id}`)} size="sm" className="w-full"><MessageCircle className="w-4 h-4 mr-2" />Enviar mensagem</Button>
                        </>
                      )}
                      {connection?.status === 'pendente' && <Badge variant="outline" className="w-full justify-center py-2">Pedido enviado</Badge>}
                    </div>
                  )}
                  {isOwnProfile && <Button onClick={() => toast.info('Edição de perfil (modo demo)')} variant="outline" size="sm" className="w-full">Editar perfil</Button>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right content */}
          <div>
            <Tabs defaultValue="sobre" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sobre">Sobre</TabsTrigger>
                <TabsTrigger value="outs">Outs Organizados</TabsTrigger>
                <TabsTrigger value="conexoes">Conexões</TabsTrigger>
              </TabsList>

              <TabsContent value="sobre" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Sobre</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {profile.bio ? <p className="whitespace-pre-wrap">{profile.bio}</p> : <p className="text-muted-foreground italic">Nenhuma bio adicionada.</p>}
                    {hobbies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Hobbies</h3>
                        <div className="flex flex-wrap gap-2">{hobbies.map(uh => <Badge key={uh.hobby_id} variant="secondary">{uh.hobbies.name}</Badge>)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
                  <CardContent>
                    {posts.length === 0 ? <p className="text-center text-muted-foreground italic py-4">Nenhum post ainda.</p> : (
                      <div className="space-y-4">
                        {posts.map(post => <PostCard key={post.id} post={post} currentUserId={user?.id} onLike={handleLike} onComment={handleCommentClick} />)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outs" className="space-y-4">
                {outs.length === 0 ? <Card><CardContent className="py-8"><p className="text-center text-muted-foreground italic">Nenhum Out organizado.</p></CardContent></Card> : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {outs.map(out => {
                      const hobby = MOCK_HOBBIES.find(h => h.id === out.hobby_id);
                      return (
                        <Card key={out.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader><CardTitle className="text-lg">{out.title}</CardTitle></CardHeader>
                          <CardContent className="space-y-2">
                            {hobby && <Badge variant="secondary">{hobby.name}</Badge>}
                            {out.city && <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{out.city}</div>}
                            <Button onClick={() => navigate(`/out/${out.id}`)} variant="outline" size="sm" className="w-full mt-2">Ver Out</Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="conexoes" className="space-y-4">
                {acceptedConnections.length === 0 ? <Card><CardContent className="py-8"><p className="text-center text-muted-foreground italic">Nenhuma conexão.</p></CardContent></Card> : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {acceptedConnections.map((conn: any) => (
                      <Card key={conn.user_id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <Avatar className="w-20 h-20"><AvatarImage src={conn.avatar_url} /><AvatarFallback className="bg-primary text-primary-foreground text-xl">{conn.display_name?.[0]}</AvatarFallback></Avatar>
                            <div><h3 className="font-semibold">{conn.display_name}</h3><p className="text-sm text-muted-foreground">@{conn.handle}</p></div>
                            <Button onClick={() => navigate(`/u/${conn.handle}`)} variant="outline" size="sm" className="w-full">Ver Perfil</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfile;
