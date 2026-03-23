import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MOCK_INVITES, MOCK_HOBBIES, MOCK_PROFILES, MOCK_INVITE_SLOTS } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Outs: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedHobby, setSelectedHobby] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');

  const outs = MOCK_INVITES.map(inv => {
    const author = MOCK_PROFILES.find(p => p.user_id === inv.author_id);
    const hobby = MOCK_HOBBIES.find(h => h.id === inv.hobby_id);
    return { ...inv, author: author ? { display_name: author.display_name, avatar_url: author.avatar_url } : null, hobby: hobby ? { name: hobby.name } : null };
  });

  const nextSlots: Record<number, { date: string; start_time: string }> = {};
  for (const slot of MOCK_INVITE_SLOTS) {
    if (!nextSlots[slot.invite_id]) nextSlots[slot.invite_id] = slot;
  }

  const filteredOuts = outs.filter((out) => {
    const matchesText = searchText === '' || out.title?.toLowerCase().includes(searchText.toLowerCase()) || out.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesHobby = selectedHobby === 'all' || String(out.hobby_id) === selectedHobby;
    const matchesMode = selectedMode === 'all' || out.mode === selectedMode;
    const matchesPayment = selectedPayment === 'all' || out.payment_type === selectedPayment;
    return matchesText && matchesHobby && matchesMode && matchesPayment;
  });

  const getModeLabel = (mode: string) => ({ presencial: 'Presencial', online: 'Online', hibrido: 'Híbrido' }[mode] || mode);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Descobrir Outs</h1>
        <div className="flex gap-4 mb-6">
          <Input placeholder="Buscar por palavra..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="flex-1" />
          <Select value={selectedHobby} onValueChange={setSelectedHobby}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por hobby" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os hobbies</SelectItem>
              {MOCK_HOBBIES.map((hobby) => (<SelectItem key={hobby.id} value={String(hobby.id)}>{hobby.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Modo" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="presencial">Presencial</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="hibrido">Híbrido</SelectItem></SelectContent>
          </Select>
          <Select value={selectedPayment} onValueChange={setSelectedPayment}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Pagamento" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="gratuito">Gratuito</SelectItem><SelectItem value="pago">Pago</SelectItem></SelectContent>
          </Select>
        </div>
        {filteredOuts.length === 0 ? (
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
                        {(out.hobby || out.custom_hobby) && <Badge variant="secondary">{out.hobby?.name || out.custom_hobby}</Badge>}
                        <Badge className="badge-mode">{getModeLabel(out.mode)}</Badge>
                        {out.payment_type === 'pago' ? <Badge variant="default">R$ {out.price?.toFixed(2).replace('.', ',')}</Badge> : <Badge variant="outline">Gratuito</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {out.city && <Badge variant="secondary" className="flex items-center gap-1"><MapPin className="h-3 w-3" />{out.city}</Badge>}
                        {nextSlots[out.id] && (
                          <Badge className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />
                            {format(new Date(nextSlots[out.id].date + 'T00:00:00'), "EEE, d 'de' LLL", { locale: ptBR })}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8"><AvatarImage src={out.author?.avatar_url} /><AvatarFallback className="bg-primary text-primary-foreground text-xs">{out.author?.display_name?.[0] || 'U'}</AvatarFallback></Avatar>
                      <span className="text-sm text-muted-foreground">{out.author?.display_name || 'Usuário'}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{out.description || 'Sem descrição'}</p>
                  <Button onClick={() => navigate(`/out/${out.id}`)} variant="outline" size="sm">Ver mais</Button>
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
