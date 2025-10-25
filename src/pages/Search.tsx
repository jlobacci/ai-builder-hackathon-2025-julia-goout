import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, MapPin, User, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OutResult {
  id: number;
  title: string;
  description: string | null;
  city: string | null;
  mode: string | null;
  created_at: string;
  author_id: string;
  hobby_id: number | null;
  custom_hobby: string | null;
  hobby?: { name: string };
  author?: { display_name: string; avatar_url: string | null };
}

interface PersonResult {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  hobbies?: Array<{ hobby: { name: string } }>;
}

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'outs' | 'pessoas'>('outs');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [outsResults, setOutsResults] = useState<OutResult[]>([]);
  const [peopleResults, setPeopleResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 20;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Execute search when debounced term changes
  useEffect(() => {
    if (debouncedTerm.length >= 2) {
      if (activeTab === 'outs') {
        searchOuts();
      } else {
        searchPeople();
      }
    } else {
      setOutsResults([]);
      setPeopleResults([]);
      setHasMore(false);
    }
  }, [debouncedTerm, activeTab, page]);

  const searchOuts = async () => {
    setLoading(true);
    try {
      const searchPattern = `%${debouncedTerm}%`;
      
      let query = supabase
        .from('invites')
        .select(`
          id,
          title,
          description,
          city,
          mode,
          created_at,
          author_id,
          hobby_id,
          hobbies:hobby_id (name),
          profiles:author_id (display_name, avatar_url)
        `)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern},city.ilike.${searchPattern}`)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        ...item,
        hobby: item.hobbies,
        author: item.profiles
      })) || [];

      if (page === 0) {
        setOutsResults(formattedData);
      } else {
        setOutsResults(prev => [...prev, ...formattedData]);
      }
      
      setHasMore(data?.length === pageSize);
    } catch (error) {
      console.error('Error searching outs:', error);
      toast.error('Erro ao buscar outs');
    } finally {
      setLoading(false);
    }
  };

  const searchPeople = async () => {
    setLoading(true);
    try {
      const searchPattern = `%${debouncedTerm}%`;
      
      let query = supabase
        .from('v_public_profiles')
        .select(`
          user_id,
          display_name,
          handle,
          avatar_url,
          city,
          state,
          bio,
          user_hobbies (
            hobby:hobbies (name)
          )
        `)
        .or(`display_name.ilike.${searchPattern},handle.ilike.${searchPattern},city.ilike.${searchPattern}`)
        .neq('user_id', user?.id || '')
        .order('display_name', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        ...item,
        hobbies: item.user_hobbies
      })) || [];

      if (page === 0) {
        setPeopleResults(formattedData);
      } else {
        setPeopleResults(prev => [...prev, ...formattedData]);
      }
      
      setHasMore(data?.length === pageSize);
    } catch (error) {
      console.error('Error searching people:', error);
      toast.error('Erro ao buscar pessoas');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (targetUserId: string) => {
    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${user?.id},target_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},target_id.eq.${user?.id})`)
        .single();

      if (existing) {
        toast.info('Você já tem uma conexão com esta pessoa');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user?.id,
          target_id: targetUserId,
          status: 'pendente'
        });

      if (error) throw error;

      toast.success('Solicitação de conexão enviada!');
    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error('Erro ao enviar solicitação');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    setOutsResults([]);
    setPeopleResults([]);
    setPage(0);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl">Buscar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'outs' | 'pessoas')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="outs">Outs</TabsTrigger>
                <TabsTrigger value="pessoas">Pessoas</TabsTrigger>
              </TabsList>

              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeTab === 'outs'
                      ? 'Busque por título, descrição, hobby ou cidade…'
                      : 'Busque por nome, @handle ou cidade…'
                  }
                  className="pl-9 pr-9"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <TabsContent value="outs" className="mt-6">
                {debouncedTerm.length < 2 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Digite pelo menos 2 caracteres para começar a buscar</p>
                  </div>
                ) : loading && page === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : outsResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum out encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outsResults.map((out) => (
                      <Card
                        key={out.id}
                        className="rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/out/${out.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-lg">{out.title}</h3>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {(out.hobby?.name || out.custom_hobby) && (
                                  <Badge className="badge-mode">
                                    {out.hobby?.name || out.custom_hobby}
                                  </Badge>
                                )}
                                {out.city && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {out.city}
                                  </span>
                                )}
                                {out.mode && (
                                  <Badge variant="outline" className="text-xs">
                                    {out.mode === 'presencial' ? 'Presencial' : out.mode === 'online' ? 'Online' : 'Híbrido'}
                                  </Badge>
                                )}
                              </div>

                              {out.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {out.description}
                                </p>
                              )}

                              {out.author && (
                                <div className="flex items-center gap-2 pt-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={out.author.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {out.author.display_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {out.author.display_name}
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/out/${out.id}`);
                              }}
                            >
                              Abrir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {hasMore && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPage(p => p + 1)}
                          disabled={loading}
                        >
                          {loading ? 'Carregando...' : 'Carregar mais'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pessoas" className="mt-6">
                {debouncedTerm.length < 2 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Digite pelo menos 2 caracteres para começar a buscar</p>
                  </div>
                ) : loading && page === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-1/2" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : peopleResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma pessoa encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {peopleResults.map((person) => (
                      <Card
                        key={person.user_id}
                        className="rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/u/${person.handle}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={person.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {person.display_name[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-2">
                              <div>
                                <h3 className="font-semibold">{person.display_name}</h3>
                                <p className="text-sm text-muted-foreground">@{person.handle}</p>
                              </div>

                              {(person.city || person.state) && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {[person.city, person.state].filter(Boolean).join(', ')}
                                </p>
                              )}

                              {person.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {person.bio}
                                </p>
                              )}

                              {person.hobbies && person.hobbies.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {person.hobbies.slice(0, 3).map((h: any, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {h.hobby.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/u/${person.handle}`);
                                }}
                              >
                                Ver perfil
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnect(person.user_id);
                                }}
                              >
                                Conectar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {hasMore && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPage(p => p + 1)}
                          disabled={loading}
                        >
                          {loading ? 'Carregando...' : 'Carregar mais'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
