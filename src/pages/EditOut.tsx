import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CalendarIcon, Plus, X, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

const editOutSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  hobby_id: z.number().nullable(),
  custom_hobby: z.string().optional(),
  city: z.string().optional(),
  slots: z.number().min(1).max(5),
  mode: z.enum(['presencial', 'online', 'hibrido']),
}).refine(
  (data) => data.hobby_id !== null || (data.custom_hobby && data.custom_hobby.trim().length > 0),
  { message: 'Selecione um hobby da lista ou digite um hobby customizado', path: ['hobby_id'] }
);

type TimeSlot = {
  id?: number;
  date: Date | undefined;
  start_time: string;
  end_time: string;
};

const EditOut: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [isAuthor, setIsAuthor] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hobby_id: null as number | null,
    custom_hobby: '',
    city: '',
    slots: 3,
    bring_own_materials: false,
    materials: '',
    mode: 'presencial' as 'presencial' | 'online' | 'hibrido',
    time_is_fixed: true,
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { date: undefined, start_time: '', end_time: '' }
  ]);

  useEffect(() => {
    if (user && id) {
      loadHobbies();
      loadOutData();
    }
  }, [user, id]);

  const loadHobbies = async () => {
    const { data } = await supabase.from('hobbies').select('*');
    if (data) setHobbies(data);
  };

  const loadOutData = async () => {
    if (!id || !user) return;

    setLoadingData(true);

    try {
      // Load invite data
      const { data: invite, error } = await supabase
        .from('invites')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (error) throw error;

      // Check if user is author
      if (invite.author_id !== user.id) {
        toast.error('Você não tem permissão para editar este Out');
        navigate('/my-outs');
        return;
      }

      setIsAuthor(true);

      // Load time slots
      const { data: slots } = await supabase
        .from('invite_slots')
        .select('*')
        .eq('invite_id', Number(id))
        .order('date', { ascending: true });

      // Set form data
      setFormData({
        title: invite.title || '',
        description: invite.description || '',
        hobby_id: invite.hobby_id,
        custom_hobby: invite.custom_hobby || '',
        city: invite.city || '',
        slots: invite.slots || 3,
        bring_own_materials: invite.bring_own_materials || false,
        materials: invite.materials || '',
        mode: (invite.mode || 'presencial') as 'presencial' | 'online' | 'hibrido',
        time_is_fixed: invite.time_is_fixed ?? true,
      });

      // Set time slots
      if (slots && slots.length > 0) {
        setTimeSlots(
          slots.map((slot) => ({
            id: slot.id,
            date: parse(slot.date, 'yyyy-MM-dd', new Date()),
            start_time: slot.start_time,
            end_time: slot.end_time,
          }))
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados do Out');
      navigate('/my-outs');
    } finally {
      setLoadingData(false);
    }
  };

  const addTimeSlot = () => {
    if (timeSlots.length < 3) {
      setTimeSlots([...timeSlots, { date: undefined, start_time: '', end_time: '' }]);
    }
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !id) return;

    // Validate form
    try {
      editOutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    // Validate time slots - at least one complete slot is required
    const validSlots = timeSlots.filter(s => s.date && s.start_time && s.end_time);
    if (validSlots.length === 0) {
      toast.error('Adicione pelo menos uma data e horário para o Out.');
      return;
    }

    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      if (slot.date && slot.start_time && slot.end_time) {
        if (slot.start_time >= slot.end_time) {
          toast.error('A hora de término deve ser depois da hora de início.');
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Build time_label from slots as fallback
      const timeLabelParts = timeSlots
        .filter(s => s.date && s.start_time && s.end_time)
        .map(s => {
          const dateStr = format(s.date!, 'dd/MM');
          return `${dateStr} ${s.start_time}–${s.end_time}`;
        });
      const time_label = timeLabelParts.length > 0 ? timeLabelParts.join('; ') : null;

      // Update invite
      const { error: updateError } = await supabase
        .from('invites')
        .update({
          title: formData.title,
          description: formData.description || null,
          hobby_id: formData.hobby_id,
          custom_hobby: formData.custom_hobby || null,
          city: formData.city || null,
          time_label: time_label,
          time_is_fixed: formData.time_is_fixed,
          slots: formData.slots,
          bring_own_materials: formData.bring_own_materials,
          materials: formData.bring_own_materials ? formData.materials : null,
          mode: formData.mode,
        })
        .eq('id', Number(id));

      if (updateError) throw updateError;

      // Delete existing slots
      await supabase.from('invite_slots').delete().eq('invite_id', Number(id));

      // Insert new slots
      const validSlots = timeSlots.filter(s => s.date && s.start_time && s.end_time);
      if (validSlots.length > 0) {
        const slotsToInsert = validSlots.map(slot => ({
          invite_id: Number(id),
          date: format(slot.date!, 'yyyy-MM-dd'),
          start_time: slot.start_time,
          end_time: slot.end_time,
        }));

        const { error: slotsError } = await supabase.from('invite_slots').insert(slotsToInsert);
        if (slotsError) throw slotsError;
      }

      toast.success('Out atualizado com sucesso!');
      navigate(`/out/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar Out');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthor) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para editar este Out.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/out/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Editar Out</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grupo 1: Título / Hobby / Modo */}
          <div className="space-y-4">
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
              <Label htmlFor="hobby">Hobby *</Label>
              <Select 
                value={formData.hobby_id?.toString() || ''} 
                onValueChange={(value) => setFormData({ ...formData, hobby_id: parseInt(value) })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione um hobby" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {hobbies.map((hobby) => (
                    <SelectItem key={hobby.id} value={hobby.id.toString()}>
                      {hobby.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom_hobby">Outro hobby (opcional)</Label>
              <Input
                id="custom_hobby"
                value={formData.custom_hobby}
                onChange={(e) => setFormData({ ...formData, custom_hobby: e.target.value })}
                placeholder="Se não encontrou seu hobby na lista, digite aqui..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Especifique um hobby que não está na lista acima
              </p>
            </div>

            <div>
              <Label>Modo *</Label>
              <div className="flex gap-2 mt-2">
                {(['presencial', 'online', 'hibrido'] as const).map((mode) => (
                  <Button
                    key={mode}
                    type="button"
                    variant={formData.mode === mode ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, mode })}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Grupo 2: Cidade / Vagas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="slots">Vagas (1-5) *</Label>
              <Input
                id="slots"
                type="number"
                min={1}
                max={5}
                value={formData.slots}
                onChange={(e) => setFormData({ ...formData, slots: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          {/* Grupo 3: Materiais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="materials"
                checked={formData.bring_own_materials}
                onCheckedChange={(checked) => setFormData({ ...formData, bring_own_materials: checked })}
              />
              <Label htmlFor="materials">Precisa levar material?</Label>
            </div>

            {formData.bring_own_materials && (
              <div>
                <Label htmlFor="materials-text">Quais materiais levar?</Label>
                <Textarea
                  id="materials-text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="Ex: Raquete de tênis, bola, roupa confortável..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Grupo 4: Horário */}
          <div className="space-y-4">
            <div>
              <Label>Horário fixo ou aberto?</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={formData.time_is_fixed ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, time_is_fixed: true })}
                >
                  Horário fixo
                </Button>
                <Button
                  type="button"
                  variant={!formData.time_is_fixed ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, time_is_fixed: false })}
                >
                  Horário aberto (a combinar)
                </Button>
              </div>
              {!formData.time_is_fixed && (
                <p className="text-sm text-muted-foreground mt-2">
                  Podemos ajustar o melhor dia/horário juntos.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Datas e horários possíveis (até 3)</Label>
                {timeSlots.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar opção
                  </Button>
                )}
              </div>

              {timeSlots.map((slot, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Opção {index + 1}</span>
                    {timeSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Dia</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !slot.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {slot.date ? format(slot.date, "dd/MM/yyyy") : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={slot.date}
                          onSelect={(date) => updateTimeSlot(index, 'date', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Hora de início</Label>
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Hora de término</Label>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grupo 5: Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descreva mais sobre este Out..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/out/${id}`)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditOut;
