import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

const Outs: React.FC = () => {
  const navigate = useNavigate();
  const [outs, setOuts] = useState<any[]>([]);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedHobby, setSelectedHobby] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const { data: hobbiesData } = await supabase.from('hobbies').select('*');
    if (hobbiesData) setHobbies(hobbiesData);

    const { data: outsData } = await supabase
      .from('invites')
      .select(`
        *,
        author:profiles!invites_author_id_fkey(display_name, avatar_url),
        hobby:hobbies(name)
      `)
      .order('created_at', { ascending: false });

    if (outsData) setOuts(outsData);
    setLoading(false);
  };

  const filteredOuts = outs.filter((out) => {
    const matchesText = searchText === '' || 
      out.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      out.description?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesHobby = selectedHobby === 'all' || out.hobby_id === selectedHobby;
    const matchesMode = selectedMode === 'all' || out.mode === selectedMode;

    return matchesText && matchesHobby && matchesMode;
  });

  const getModeLabel = (mode: string) => {
    const labels = {
      presencial: 'Presencial',
      online: 'Online',
      hibrido: 'Híbrido'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Descobrir Outs</h1>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Buscar por palavra..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />

          <Select value={selectedHobby} onValueChange={setSelectedHobby}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por hobby" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os hobbies</SelectItem>
              {hobbies.map((hobby) => (
                <SelectItem key={hobby.id} value={hobby.id}>
                  {hobby.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : filteredOuts.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum Out encontrado</p>
        ) : (
          <div className="grid gap-4">
            {filteredOuts.map((out) => (
              <Card key={out.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{out.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
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
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={out.author?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {out.author?.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {out.author?.display_name || 'Usuário'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {out.description || 'Sem descrição'}
                  </p>
                  <Button
                    onClick={() => navigate(`/out/${out.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    Ver mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Outs;
