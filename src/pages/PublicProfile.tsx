import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { CheckCircle, MapPin, Star, MessageCircle, UserPlus, UserCheck, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PublicProfile: React.FC = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [ratings, setRatings] = useState<any>(null);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [connection, setConnection] = useState<any>(null);
  const [outs, setOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
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
  const [allHobbies, setAllHobbies] = useState<any[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);

  useEffect(() => {
    loadProfile();
  }, [handle, user]);

  const loadProfile = async () => {
    let profileData: any = null;

    // Se não há handle na URL, carregar o perfil do usuário logado
    if (!handle && user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      profileData = data;
    } else if (handle) {
      // Carregar perfil pelo handle
      const { data } = await supabase
        .from('profiles')
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

    // Load ratings
    const { data: ratingsData } = await supabase
      .from('v_profile_ratings' as any)
      .select('*')
      .eq('user_id', profileData.user_id)
      .maybeSingle();
    setRatings(ratingsData);

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

    // Load reviews
    const { data: reviewsData } = await supabase
      .from('reviews' as any)
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(display_name, avatar_url)')
      .eq('reviewee_id', profileData.user_id)
      .order('created_at', { ascending: false });
    setReviews(reviewsData || []);

    // Load my review if logged in
    if (user && user.id !== profileData.user_id) {
      const { data: myReviewData } = await supabase
        .from('reviews' as any)
        .select('*')
        .eq('reviewee_id', profileData.user_id)
        .eq('reviewer_id', user.id)
        .maybeSingle();
      
      if (myReviewData) {
        setMyReview(myReviewData);
        setReviewStars((myReviewData as any).stars);
        setReviewBody((myReviewData as any).body || '');
      }
    }

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

    setLoading(false);
  };

  const handleSaveReview = async () => {
    if (!user || !profile) return;

    const reviewData = {
      reviewee_id: profile.user_id,
      reviewer_id: user.id,
      stars: reviewStars,
      body: reviewBody,
    };

    if (myReview) {
      const { error } = await supabase
        .from('reviews' as any)
        .update(reviewData)
        .eq('id', myReview.id);
      
      if (error) {
        toast.error('Erro ao atualizar avaliação');
        return;
      }
      toast.success('Avaliação atualizada');
    } else {
      const { error } = await supabase
        .from('reviews' as any)
        .insert(reviewData);
      
      if (error) {
        toast.error('Erro ao salvar avaliação');
        return;
      }
      toast.success('Avaliação enviada');
    }

    loadProfile();
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;

    const { error } = await supabase
      .from('reviews' as any)
      .delete()
      .eq('id', myReview.id);
    
    if (error) {
      toast.error('Erro ao remover avaliação');
      return;
    }

    toast.success('Avaliação removida');
    setMyReview(null);
    setReviewStars(5);
    setReviewBody('');
    loadProfile();
  };

  const handleConnect = async () => {
    if (!user || !profile) return;

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

    toast.success('Pedido de conexão enviado');
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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media-avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          toast.error('Erro ao fazer upload da foto');
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

  const renderStars = (stars: number, count?: number) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? 'fill-primary text-primary'
                : i === fullStars && hasHalfStar
                ? 'fill-primary/50 text-primary'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        {count !== undefined && (
          <span className="text-sm text-muted-foreground ml-1">({count})</span>
        )}
      </div>
    );
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

                    {ratings && (
                      <div className="flex justify-center mb-3">
                        {renderStars(ratings.avg_stars || 0, ratings.reviews_count || 0)}
                      </div>
                    )}

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
                          <Badge variant="outline" className="w-full justify-center">
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

                      {connection?.status === 'aceita' && (
                        <Badge className="w-full justify-center bg-green-600">
                          <UserCheck className="w-4 h-4 mr-2" />
                          Conectado
                        </Badge>
                      )}

                      <Button
                        onClick={() => navigate(`/messages?person_id=${profile.user_id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar mensagem
                      </Button>
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
                <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                <TabsTrigger value="outs">Outs Organizados</TabsTrigger>
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

              <TabsContent value="avaliacoes" className="space-y-4">
                {user && !isOwnProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sua Avaliação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Estrelas</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewStars(s)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  s <= reviewStars ? 'fill-primary text-primary' : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Comentário</label>
                        <Textarea
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          placeholder="Escreva sua avaliação..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSaveReview}>
                          {myReview ? 'Atualizar avaliação' : 'Salvar avaliação'}
                        </Button>
                        {myReview && (
                          <Button onClick={handleDeleteReview} variant="outline">
                            Remover avaliação
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Todas as Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <p className="text-muted-foreground italic">Nenhuma avaliação ainda.</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.reviewer?.avatar_url} />
                                <AvatarFallback>
                                  {review.reviewer?.display_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{review.reviewer?.display_name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(review.created_at), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                                {renderStars(review.stars)}
                                {review.body && <p className="mt-2">{review.body}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
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
      </div>
    </Layout>
  );
};

export default PublicProfile;
