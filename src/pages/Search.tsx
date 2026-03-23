import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MOCK_INVITES, MOCK_PROFILES, MOCK_HOBBIES, MOCK_USER_HOBBIES } from '@/lib/mock-data';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, MapPin, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'outs' | 'pessoas'>('outs');
  const [searchTerm, setSearchTerm] = useState('');

  const term = searchTerm.toLowerCase();

  const outsResults = term.length >= 2 ? MOCK_INVITES.filter(o =>
    o.title.toLowerCase().includes(term) || o.description?.toLowerCase().includes(term) || o.city?.toLowerCase().includes(term)
  ).map(o => {
    const author = MOCK_PROFILES.find(p => p.user_id === o.author_id);
    const hobby = MOCK_HOBBIES.find(h => h.id === o.hobby_id);
    return { ...o, author: author ? { display_name: author.display_name, avatar_url: author.avatar_url } : null, hobby: hobby ? { name: hobby.name } : null };
  }) : [];

  const peopleResults = term.length >= 2 ? MOCK_PROFILES.filter(p =>
    p.user_id !== user?.id && (p.display_name.toLowerCase().includes(term) || p.handle.toLowerCase().includes(term) || p.city?.toLowerCase().includes(term))
  ) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <CardHeader><CardTitle className="text-2xl">Buscar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'outs' | 'pessoas')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="outs">Outs</TabsTrigger>
                <TabsTrigger value="pessoas">Pessoas</TabsTrigger>
              </TabsList>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeTab === 'outs' ? 'Busque por título, descrição ou cidade…' : 'Busque por nome, @handle ou cidade…'}
                  className="pl-9 pr-9" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
              </div>

              <TabsContent value="outs" className="mt-6">
                {term.length < 2 ? (
                  <div className="text-center py-12 text-muted-foreground"><SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Digite pelo menos 2 caracteres</p></div>
                ) : outsResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground"><p>Nenhum out encontrado</p></div>
                ) : (
                  <div className="space-y-4">
                    {outsResults.map((out) => (
                      <Card key={out.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/out/${out.id}`)}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg">{out.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {out.hobby && <Badge className="badge-mode">{out.hobby.name}</Badge>}
                            {out.city && <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{out.city}</span>}
                          </div>
                          {out.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{out.description}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pessoas" className="mt-6">
                {term.length < 2 ? (
                  <div className="text-center py-12 text-muted-foreground"><User className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Digite pelo menos 2 caracteres</p></div>
                ) : peopleResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground"><p>Nenhuma pessoa encontrada</p></div>
                ) : (
                  <div className="space-y-4">
                    {peopleResults.map((person) => (
                      <Card key={person.user_id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/u/${person.handle}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12"><AvatarImage src={person.avatar_url || undefined} /><AvatarFallback className="bg-primary text-primary-foreground">{person.display_name[0]}</AvatarFallback></Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">{person.display_name}</h3>
                              <p className="text-sm text-muted-foreground">@{person.handle}</p>
                              {person.city && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{person.city}, {person.state}</p>}
                            </div>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/u/${person.handle}`); }}>Ver perfil</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
