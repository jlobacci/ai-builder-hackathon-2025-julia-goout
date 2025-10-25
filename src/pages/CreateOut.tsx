import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';

const createOutSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  hobby_id: z.string().min(1, 'Selecione um hobby'),
  city: z.string().optional(),
  time_label: z.string().optional(),
  time_window: z.string().optional(),
  slots: z.number().min(1).max(5),
  mode: z.enum(['presencial', 'online', 'hibrido']),
});

const CreateOut: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [hobbies, setHobbies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hobby_id: '',
    city: '',
    time_label: '',
    time_window: 'manha',
    slots: 3,
    bring_own_materials: false,
    mode: 'presencial' as 'presencial' | 'online' | 'hibrido',
  });

  useEffect(() => {
    checkVerification();
    loadHobbies();
  }, [user]);

  const checkVerification = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('verified')
      .eq('user_id', user.id)
      .single();

    setVerified(data?.verified || false);
  };

  const loadHobbies = async () => {
    const { data } = await supabase.from('hobbies').select('*');
    if (data) setHobbies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      createOutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('invites')
        .insert({
          author_id: user.id,
          title: formData.title,
          description: formData.description || null,
          hobby_id: formData.hobby_id || null,
          city: formData.city || null,
          time_label: formData.time_label || null,
          time_window: formData.time_window || null,
          slots: formData.slots,
          slots_taken: 0,
          bring_own_materials: formData.bring_own_materials,
          mode: formData.mode,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Out criado com sucesso!');
      navigate(`/out/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar Out');
    } finally {
      setLoading(false);
    }
  };

  if (verified === null) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!verified) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa verificar seu perfil (CPF) para criar Outs.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Criar Out</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="hobby">Hobby *</Label>
            <Select value={formData.hobby_id} onValueChange={(value) => setFormData({ ...formData, hobby_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um hobby" />
              </SelectTrigger>
              <SelectContent>
                {hobbies.map((hobby) => (
                  <SelectItem key={hobby.id} value={hobby.id}>
                    {hobby.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time_label">Horário</Label>
              <Input
                id="time_label"
                placeholder="Ex: Sáb 9h–11h"
                value={formData.time_label}
                onChange={(e) => setFormData({ ...formData, time_label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="time_window">Janela</Label>
              <Select value={formData.time_window} onValueChange={(value) => setFormData({ ...formData, time_window: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="slots">Vagas (1-5)</Label>
            <Input
              id="slots"
              type="number"
              min={1}
              max={5}
              value={formData.slots}
              onChange={(e) => setFormData({ ...formData, slots: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="materials"
              checked={formData.bring_own_materials}
              onCheckedChange={(checked) => setFormData({ ...formData, bring_own_materials: checked })}
            />
            <Label htmlFor="materials">Precisa levar material?</Label>
          </div>

          <div>
            <Label>Modo</Label>
            <div className="flex gap-2 mt-2">
              {(['presencial', 'online', 'hibrido'] as const).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  variant={formData.mode === mode ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, mode })}
                  className={formData.mode === mode ? 'btn-primary' : ''}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Out'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateOut;
