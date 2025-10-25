import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, MapPin, MessageCircle, UserPlus, UserCheck, X, Upload, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ImageCropper } from '@/components/ImageCropper';

const PublicProfile: React.FC = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [outs, setOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    city: '',
    state: '',
    country: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [tempAvatarPreview, setTempAvatarPreview] = useState<string>('');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [allHobbies, setAllHobbies] = useState<any[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      loadProfile();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [handle, user]);

  const loadProfile = async () => {
    let profileData: any = null;

    // Se não há handle na URL, carregar o perfil do usuário logado
    if (!handle && user) {
      // Own profile: use profiles table to access all fields including sensitive data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      profileData = data;
    } else if (handle && user) {
      // First check if this is the user's own profile by handle
      const { data: checkOwnProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('handle', handle)
        .maybeSingle();
      
      if (checkOwnProfile?.user_id === user.id) {
        // Own profile: use profiles table
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('handle', handle)
          .maybeSingle();
        profileData = data;
      } else {
        // Other user's profile: use safe view (no sensitive data)
        const { data } = await supabase
          .from('v_public_profiles')
          .select('*')
          .eq('handle', handle)
          .maybeSingle();
        profileData = data;
      }
    } else if (handle && !user) {
      // Not logged in: use safe view
      const { data } = await supabase
        .from('v_public_profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();
      profileData = data;
    }

    if (!profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);
    
    // Preencher formulário de edição
    setEditForm({
      display_name: profileData.display_name || '',
      bio: profileData.bio || '',
      city: profileData.city || '',
      state: profileData.state || '',
      country: profileData.country || '',
    });
    setAvatarPreview(profileData.avatar_url || '');

    // Load hobbies
    const { data: hobbiesData } = await supabase
      .from('user_hobbies')
      .select('*, hobbies(*)')
      .eq('user_id', profileData.user_id);
    setHobbies(hobbiesData || []);
    setSelectedHobbies((hobbiesData || []).map((h: any) => h.hobby_id));
    
    // Load all hobbies for selection
    const { data: allHobbiesData } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');
    setAllHobbies(allHobbiesData || []);

    // Load connection status
    if (user && user.id !== profileData.user_id) {
      const { data: connData } = await supabase
        .from('connections' as any)
        .select('*')
        .or(`and(requester_id.eq.${user.id},target_id.eq.${profileData.user_id}),and(requester_id.eq.${profileData.user_id},target_id.eq.${user.id})`)
        .maybeSingle();
      setConnection(connData);
    }

    // Load outs
    const { data: outsData } = await supabase
      .from('invites')
      .select('*, hobbies(*)')
      .eq('author_id', profileData.user_id)
      .order('created_at', { ascending: false });
    setOuts(outsData || []);

    // Load connections (only accepted ones)
    const { data: connectionsData } = await supabase
      .from('connections' as any)
      .select('*')
      .eq('status', 'aceita')
      .or(`requester_id.eq.${profileData.user_id},target_id.eq.${profileData.user_id}`);

    if (connectionsData) {
      // Get the other user's profile for each connection
      const connectionProfiles = await Promise.all(
        connectionsData.map(async (conn: any) => {
          const otherId = conn.requester_id === profileData.user_id ? conn.target_id : conn.requester_id;
          const { data: otherProfile } = await supabase
            .from('v_public_profiles')
            .select('*')
            .eq('user_id', otherId)
            .maybeSingle();
          return otherProfile;
        })
      );
      setConnections(connectionProfiles.filter(Boolean));
    }

    // Load pending requests (only if viewing own profile)
    if (user && user.id === profileData.user_id) {
      const { data: pendingData } = await supabase
        .from('connections' as any)
        .select('*')
        .eq('target_id', profileData.user_id)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (pendingData) {
        const requestProfiles = await Promise.all(
          pendingData.map(async (req: any) => {
            const { data: requesterProfile } = await supabase
              .from('v_public_profiles')
              .select('*')
              .eq('user_id', req.requester_id)
              .maybeSingle();
            return { ...req, requester_profile: requesterProfile };
          })
        );
        setPendingRequests(requestProfiles.filter(r => r.requester_profile));
      }
    }

    setLoading(false);
  };

  const handleConnect = async () => {
    if (!user || !profile) return;

    // Check if connection already exists
    const { data: existingConn } = await supabase
      .from('connections' as any)
      .select('*')
      .or(`and(requester_id.eq.${user.id},target_id.eq.${profile.user_id}),and(requester_id.eq.${profile.user_id},target_id.eq.${user.id})`)
      .maybeSingle();

    if (existingConn && 'status' in existingConn && 'id' in existingConn) {
      if (existingConn.status === 'recusada') {
        // Allow retry after rejection - update existing connection
        const { error } = await supabase
          .from('connections' as any)
          .update({ status: 'pendente', requester_id: user.id, target_id: profile.user_id, created_at: new Date().toISOString() })
          .eq('id', existingConn.id);
        
        if (error) {
          toast.error('Erro ao enviar pedido');
          return;
        }
      } else {
        toast.error('Já existe uma solicitação entre vocês');
        return;
      }
    } else {
      // Create new connection
      const { error } = await supabase
        .from('connections' as any)
        .insert({
          requester_id: user.id,
          target_id: profile.user_id,
          status: 'pendente',
        });
      
      if (error) {
        toast.error('Erro ao enviar pedido');
        return;
      }
    }

    toast.success('Convite enviado');
    loadProfile();
  };

  const handleCancelConnection = async () => {
    if (!connection) return;

    const { error } = await supabase
      .from('connections' as any)
      .delete()
      .eq('id', connection.id);
    
    if (error) {
      toast.error('Erro ao cancelar pedido');
      return;
    }

    toast.success('Pedido cancelado');
    setConnection(null);
  };

  const handleAcceptConnection = async () => {
    if (!connection) return;

    const { error } = await supabase
      .from('connections' as any)
      .update({ status: 'aceita' })
      .eq('id', connection.id);
    
    if (error) {
      toast.error('Erro ao aceitar conexão');
      return;
    }

    toast.success('Conexão aceita');
    loadProfile();
  };

  const handleRejectConnection = async () => {
    if (!connection) return;

    const { error } = await supabase
      .from('connections' as any)
      .update({ status: 'recusada' })
      .eq('id', connection.id);
    
    if (error) {
      toast.error('Erro ao recusar conexão');
      return;
    }

    toast.success('Conexão recusada');
    loadProfile();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatarPreview(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);
    
    setCropDialogOpen(false);
  };

  const handleToggleHobby = (hobbyId: number) => {
    setSelectedHobbies(prev => 
      prev.includes(hobbyId) 
        ? prev.filter(id => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = 'jpg';
        const fileName = `${profile.user_id}/${profile.user_id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media-avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          toast.error('Erro ao fazer upload da foto');
          console.error(uploadError);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media-avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          bio: editForm.bio,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          avatar_url: avatarUrl,
        })
        .eq('user_id', profile.user_id);

      if (profileError) {
        toast.error('Erro ao atualizar perfil');
        return;
      }

      // Update hobbies
      // Delete current hobbies
      await supabase
        .from('user_hobbies')
        .delete()
        .eq('user_id', profile.user_id);

      // Insert new hobbies
      if (selectedHobbies.length > 0) {
        const { error: hobbiesError } = await supabase
          .from('user_hobbies')
          .insert(
            selectedHobbies.map(hobby_id => ({
              user_id: profile.user_id,
              hobby_id,
            }))
          );

        if (hobbiesError) {
          toast.error('Erro ao atualizar hobbies');
          return;
        }
      }

      toast.success('Perfil atualizado com sucesso');
      setEditDialogOpen(false);
      setAvatarFile(null);
      loadProfile();
    } catch (error) {
      toast.error('Erro ao salvar perfil');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4">
          <p className="text-center text-muted-foreground">Perfil não encontrado</p>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

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
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                      {profile.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                      {profile.verified && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">@{profile.handle}</p>

                    {(profile.city || profile.state || profile.country) && (
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {[profile.city, profile.state, profile.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isOwnProfile && user && (
                    <div className="w-full space-y-2">
                      {!connection && (
                        <Button onClick={handleConnect} className="w-full" size="sm">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Se conectar
                        </Button>
                      )}
                      
                      {connection?.status === 'pendente' && connection.requester_id === user.id && (
                        <div className="space-y-2">
                          <Badge variant="outline" className="w-full justify-center py-2">
                            Pedido enviado
                          </Badge>
                          <Button onClick={handleCancelConnection} variant="outline" size="sm" className="w-full">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      )}

                      {connection?.status === 'pendente' && connection.target_id === user.id && (
                        <div className="space-y-2">
                          <Button onClick={handleAcceptConnection} size="sm" className="w-full">
                            Aceitar
                          </Button>
                          <Button onClick={handleRejectConnection} variant="outline" size="sm" className="w-full">
                            Recusar
                          </Button>
                        </div>
                      )}

                      {connection?.status === 'recusada' && (
                        <div className="space-y-2">
                          <Badge variant="outline" className="w-full justify-center py-2 text-muted-foreground">
                            Convite recusado
                          </Badge>
                          <Button onClick={handleConnect} variant="outline" size="sm" className="w-full">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Tentar novamente
                          </Button>
                        </div>
                      )}

                      {connection?.status === 'aceita' && (
                        <>
                          <Badge className="w-full justify-center py-2 bg-green-600 hover:bg-green-600">
                            <UserCheck className="w-4 h-4 mr-2" />
                            Conectado
                          </Badge>
                          <Button
                            onClick={() => navigate(`/messages?person_id=${profile.user_id}`)}
                            size="sm"
                            className="w-full"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Enviar mensagem
                          </Button>
                        </>
                      )}

                      {!connection?.status || connection?.status === 'recusada' || connection?.status === 'aceita' ? null : (
                        <Button
                          onClick={() => navigate(`/messages?person_id=${profile.user_id}`)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Enviar mensagem
                        </Button>
                      )}
                    </div>
                  )}

                  {isOwnProfile && (
                    <Button onClick={() => setEditDialogOpen(true)} variant="outline" size="sm" className="w-full">
                      Editar perfil
                    </Button>
                  )}
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
                  <CardHeader>
                    <CardTitle>Sobre</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.bio ? (
                      <p className="whitespace-pre-wrap">{profile.bio}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Nenhuma bio adicionada.</p>
                    )}

                    {hobbies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Hobbies</h3>
                        <div className="flex flex-wrap gap-2">
                          {hobbies.map((uh) => (
                            <Badge key={uh.hobby_id} variant="secondary">
                              {uh.hobbies.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outs" className="space-y-4">
                {outs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground italic">
                        Nenhum Out organizado ainda.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {outs.map((out) => (
                      <Card key={out.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{out.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {out.hobbies && (
                            <Badge variant="secondary">{out.hobbies.name}</Badge>
                          )}
                          <div className="text-sm text-muted-foreground space-y-1">
                            {out.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {out.city}
                              </div>
                            )}
                            <div>Modo: {out.mode}</div>
                            <div>
                              Vagas: {out.slots_taken || 0}/{out.slots}
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/out/${out.id}`)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                          >
                            Ver Out
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="conexoes" className="space-y-4">
                <Tabs defaultValue="minhas" className="w-full">
                  <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="minhas">Minhas Conexões</TabsTrigger>
                    {isOwnProfile && (
                      <TabsTrigger value="solicitacoes">
                        Solicitações
                        {pendingRequests.length > 0 && (
                          <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                            {pendingRequests.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="minhas" className="mt-4">
                    {connections.length === 0 ? (
                      <Card>
                        <CardContent className="py-8">
                          <p className="text-center text-muted-foreground italic">
                            Nenhuma conexão ainda.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {connections.map((conn) => (
                          <Card key={conn.user_id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex flex-col items-center text-center space-y-3">
                                <Avatar className="w-20 h-20">
                                  <AvatarImage src={conn.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {conn.display_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{conn.display_name}</h3>
                                  <p className="text-sm text-muted-foreground">@{conn.handle}</p>
                                  {(conn.city || conn.state) && (
                                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>
                                        {[conn.city, conn.state].filter(Boolean).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full space-y-2">
                                  <Button
                                    onClick={() => navigate(`/profile/${conn.handle}`)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    Ver Perfil
                                  </Button>
                                  <Button
                                    onClick={() => navigate(`/messages?person_id=${conn.user_id}`)}
                                    size="sm"
                                    className="w-full"
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Enviar mensagem
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {isOwnProfile && (
                    <TabsContent value="solicitacoes" className="mt-4">
                      {pendingRequests.length === 0 ? (
                        <Card>
                          <CardContent className="py-8">
                            <p className="text-center text-muted-foreground italic">
                              Nenhum convite pendente.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {pendingRequests.map((req) => (
                            <Card key={req.id} className="hover:shadow-lg transition-shadow">
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                  <Avatar className="w-16 h-16">
                                    <AvatarImage src={req.requester_profile.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                      {req.requester_profile.display_name?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{req.requester_profile.display_name}</h3>
                                    <p className="text-sm text-muted-foreground">@{req.requester_profile.handle}</p>
                                    {(req.requester_profile.city || req.requester_profile.state) && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>
                                          {[req.requester_profile.city, req.requester_profile.state]
                                            .filter(Boolean)
                                            .join(', ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={async () => {
                                        const { error } = await supabase
                                          .from('connections' as any)
                                          .update({ status: 'aceita' })
                                          .eq('id', req.id);
                                        
                                        if (error) {
                                          toast.error('Erro ao aceitar conexão');
                                          return;
                                        }

                                        toast.success('Conexão aceita');
                                        loadProfile();
                                      }}
                                      size="sm"
                                    >
                                      Aceitar
                                    </Button>
                                    <Button
                                      onClick={async () => {
                                        const { error } = await supabase
                                          .from('connections' as any)
                                          .update({ status: 'recusada' })
                                          .eq('id', req.id);
                                        
                                        if (error) {
                                          toast.error('Erro ao recusar conexão');
                                          return;
                                        }

                                        toast.success('Conexão recusada');
                                        loadProfile();
                                      }}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Recusar
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {editForm.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Escolher foto
                    </Button>
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Nome</Label>
                <Input
                  id="display_name"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Descrição</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                />
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <Label>Localização</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm text-muted-foreground">Cidade</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm text-muted-foreground">Estado</Label>
                    <Input
                      id="state"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      placeholder="Estado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm text-muted-foreground">País</Label>
                    <Input
                      id="country"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      placeholder="País"
                    />
                  </div>
                </div>
              </div>

              {/* Hobbies */}
              <div className="space-y-2">
                <Label>Hobbies</Label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {allHobbies.map((hobby) => (
                    <Badge
                      key={hobby.id}
                      variant={selectedHobbies.includes(hobby.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleToggleHobby(hobby.id)}
                    >
                      {hobby.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Cropper Dialog */}
        <ImageCropper
          image={tempAvatarPreview}
          open={cropDialogOpen}
          onClose={() => setCropDialogOpen(false)}
          onCropComplete={handleCropComplete}
        />
      </div>
    </Layout>
  );
};

export default PublicProfile;
